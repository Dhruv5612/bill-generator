const User = require("../models/user.model");
const mongoose = require("mongoose");

// Fallback in-memory companies cache if MongoDB is offline or for non-ObjectId demo users
const inMemoryUserCompanies = new Map();

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === String(id);
};

const getCompanies = async (req, res) => {
  try {
    const userId = req.userId;
    if (mongoose.connection.readyState === 1 && isValidObjectId(userId)) {
      try {
        const user = await User.findById(userId).select("companies");
        if (user && user.companies) {
          return res.status(200).json(user.companies);
        }
      } catch (err) {
        console.warn("Mongoose getCompanies warning:", err.message);
      }
    }

    const fallback = inMemoryUserCompanies.get(String(userId)) || [];
    res.status(200).json(fallback);
  } catch (error) {
    console.error("Get Companies Error:", error);
    res.status(500).json({ message: "Failed to retrieve company profiles" });
  }
};

const saveCompany = async (req, res) => {
  try {
    const userId = req.userId;
    const companyData = req.body;

    if (!companyData.companyName || !companyData.companyName.trim()) {
      return res.status(400).json({ message: "Company Name is required" });
    }

    const trimmedName = companyData.companyName.trim();
    const newCompany = {
      _id: companyData._id || new mongoose.Types.ObjectId().toString(),
      companyName: trimmedName,
      companyAddress: companyData.companyAddress || "",
      companyEmail: companyData.companyEmail || "",
      companyMobile: companyData.companyMobile || "",
      companyPAN: (companyData.companyPAN || "").toUpperCase(),
      companyGSTIN: (companyData.companyGSTIN || "").toUpperCase(),
      bankName: companyData.bankName || "",
      bankAcNo: companyData.bankAcNo || "",
      bankIFSC: (companyData.bankIFSC || "").toUpperCase(),
      isProtected: true, // Company is protected against unauthorized removal
      updatedAt: new Date(),
    };

    if (mongoose.connection.readyState === 1 && isValidObjectId(userId)) {
      try {
        const user = await User.findById(userId);
        if (user) {
          if (!user.companies) user.companies = [];

          // Check if updating existing company
          const existingIdx = user.companies.findIndex(
            (c) =>
              (c._id && c._id.toString() === newCompany._id) ||
              c.companyName.toLowerCase() === trimmedName.toLowerCase()
          );

          if (existingIdx >= 0) {
            user.companies[existingIdx] = { ...user.companies[existingIdx]._doc, ...newCompany };
          } else {
            user.companies.unshift(newCompany);
          }

          await user.save();
          return res.status(200).json({
            message: `Company profile "${trimmedName}" saved and protected.`,
            companies: user.companies,
          });
        }
      } catch (dbErr) {
        console.warn("Mongoose saveCompany warning, falling back to memory:", dbErr.message);
      }
    }

    // Fallback in-memory store
    let list = inMemoryUserCompanies.get(String(userId)) || [];
    const idx = list.findIndex(
      (c) => c.companyName.toLowerCase() === trimmedName.toLowerCase() || c._id === newCompany._id
    );
    if (idx >= 0) {
      list[idx] = newCompany;
    } else {
      list.unshift(newCompany);
    }
    inMemoryUserCompanies.set(String(userId), list);

    res.status(200).json({
      message: `Company profile "${trimmedName}" saved and protected.`,
      companies: list,
    });
  } catch (error) {
    console.error("Save Company Error:", error);
    res.status(500).json({ message: "Failed to save company profile" });
  }
};

const deleteCompany = async (req, res) => {
  try {
    const userId = req.userId;
    const { companyName, permissionGranted } = req.body;

    // Strict Permission Verification
    if (!permissionGranted) {
      return res.status(403).json({
        message: "Permission denied. Deletion must be explicitly authorized.",
      });
    }

    if (!companyName) {
      return res.status(400).json({ message: "Company name is required for removal." });
    }

    const trimmedName = companyName.trim().toLowerCase();

    if (mongoose.connection.readyState === 1 && isValidObjectId(userId)) {
      try {
        const user = await User.findById(userId);
        if (user && user.companies) {
          user.companies = user.companies.filter(
            (c) => c.companyName.toLowerCase() !== trimmedName
          );
          await user.save();
          return res.status(200).json({
            message: `Company "${companyName}" removed with authorized permission.`,
            companies: user.companies,
          });
        }
      } catch (dbErr) {
        console.warn("Mongoose deleteCompany warning:", dbErr.message);
      }
    }

    // Fallback store
    let list = inMemoryUserCompanies.get(String(userId)) || [];
    list = list.filter((c) => c.companyName.toLowerCase() !== trimmedName);
    inMemoryUserCompanies.set(String(userId), list);

    res.status(200).json({
      message: `Company "${companyName}" removed with authorized permission.`,
      companies: list,
    });
  } catch (error) {
    console.error("Delete Company Error:", error);
    res.status(500).json({ message: "Failed to remove company profile" });
  }
};

module.exports = { getCompanies, saveCompany, deleteCompany };
