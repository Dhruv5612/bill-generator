const Bill = require("../models/bill.model");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const { generatePDF } = require("../utils/pdfgenerator.util");

// In-memory fallback bill store when MongoDB is unavailable or user is local-only
const inMemoryBills = [];

const isMongoReadyForUser = (userId) => {
  return (
    mongoose.connection.readyState === 1 &&
    mongoose.Types.ObjectId.isValid(userId) &&
    String(new mongoose.Types.ObjectId(userId)) === String(userId)
  );
};

const isValidObjectId = (id) => {
  return (
    mongoose.Types.ObjectId.isValid(id) &&
    String(new mongoose.Types.ObjectId(id)) === String(id)
  );
};

const generateBill = async (req, res) => {
  try {
    const billData = { ...req.body };
    billData.userId = req.userId;
    if (!billData.billType) {
      billData.billType = "sales";
    }
    // If purchase bill, keep buyerName aligned with supplierName for seamless legacy fallback
    if (billData.billType === "purchase" && billData.supplierName && !billData.buyerName) {
      billData.buyerName = billData.supplierName;
    }

    let savedToDb = false;

    if (isMongoReadyForUser(req.userId)) {
      try {
        const existingBill = await Bill.findOne({
          invoiceNumber: billData.invoiceNumber,
        });
        if (existingBill) {
          return res
            .status(400)
            .json({ message: "Invoice number already exists. Please try again." });
        }

        const newBill = new Bill(billData);
        await newBill.save();
        savedToDb = true;
      } catch (dbErr) {
        if (dbErr.name === "ValidationError") {
          return res.status(400).json({ message: dbErr.message });
        }
        if (dbErr.code === 11000) {
          return res.status(400).json({ message: "Invoice number already exists. Please choose a different number." });
        }
        console.warn("MongoDB bill save warning, falling back to memory:", dbErr.message);
      }
    }

    if (!savedToDb) {
      const existsInMem = inMemoryBills.some(
        (b) => b.invoiceNumber === billData.invoiceNumber
      );
      if (existsInMem) {
        return res
          .status(400)
          .json({ message: "Invoice number already exists. Please try again." });
      }
      inMemoryBills.unshift({
        ...billData,
        _id: new mongoose.Types.ObjectId().toString(),
        createdAt: new Date(),
      });
    }

    // Generate PDF
    const pdfBuffer = await generatePDF(billData);
    const isPurchase = billData.billType === "purchase";
    const filePrefix = isPurchase ? "Purchase_Bill" : "Invoice";

    // Try to send Email in background (non-blocking, only if credentials & recipient exist)
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS && billData.email) {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        transporter.sendMail({
          from: `"${billData.companyName || 'BillCraft'}" <${process.env.EMAIL_USER}>`,
          to: billData.email,
          subject: isPurchase
            ? `Purchase Bill ${billData.invoiceNumber || ''} for ${billData.companyName || 'Us'}`
            : `Invoice ${billData.invoiceNumber || ''} from ${billData.companyName || 'Us'}`,
          text: `Please find attached your ${isPurchase ? "purchase bill" : "sales tax invoice"}.`,
          attachments: [
            {
              filename: `${filePrefix}_${(billData.invoiceNumber || 'document').replace(/[\/\\]/g, '-')}.pdf`,
              content: pdfBuffer,
            },
          ],
        }).then(() => console.log("Email sent successfully."))
          .catch((err) => console.error("Email failed:", err.message));
      } catch (emailError) {
        console.error("Failed to configure email:", emailError.message);
      }
    }

    // Return the PDF buffer directly to the client
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${filePrefix}_${(billData.invoiceNumber || "document").replace(/[\/\\]/g, '-')}.pdf`
    );
    res.status(200).send(pdfBuffer);

  } catch (error) {
    console.error("Bill generation error:", error);
    res.status(500).json({ message: error.message || "Failed to generate bill" });
  }
};

const getAllInvoices = async (req, res) => {
  try {
    if (isMongoReadyForUser(req.userId)) {
      try {
        const invoices = await Bill.find({ userId: req.userId }).sort({ _id: -1 });
        return res.status(200).json(invoices);
      } catch (dbErr) {
        console.warn("MongoDB getAllInvoices warning, using fallback:", dbErr.message);
      }
    }

    const userInvoices = inMemoryBills.filter(
      (b) => String(b.userId) === String(req.userId)
    );
    res.status(200).json(userInvoices);
  } catch (error) {
    console.error("Failed to fetch invoices:", error);
    res.status(500).json({ message: "Failed to fetch invoices" });
  }
};

const downloadInvoicePDF = async (req, res) => {
  try {
    const { id } = req.params;
    let invoiceData = null;

    if (isMongoReadyForUser(req.userId) && isValidObjectId(id)) {
      try {
        invoiceData = await Bill.findOne({ _id: id, userId: req.userId });
      } catch (dbErr) {
        console.warn("MongoDB downloadInvoicePDF warning:", dbErr.message);
      }
    }

    if (!invoiceData) {
      invoiceData = inMemoryBills.find(
        (b) => String(b._id) === String(id) && String(b.userId) === String(req.userId)
      );
    }

    if (!invoiceData) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // Generate PDF using existing util
    const pdfBuffer = await generatePDF(invoiceData);
    const isPurchase = invoiceData.billType === "purchase";
    const filePrefix = isPurchase ? "Purchase_Bill" : "Invoice";

    // Return the PDF buffer directly
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${filePrefix}_${(invoiceData.invoiceNumber || "document").replace(/[\/\\]/g, '-')}.pdf`
    );
    res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error("Failed to download invoice:", error);
    res.status(500).json({ message: "Failed to download invoice" });
  }
};

const deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    let deleted = false;

    if (isMongoReadyForUser(req.userId) && isValidObjectId(id)) {
      try {
        const deletedInvoice = await Bill.findOneAndDelete({ _id: id, userId: req.userId });
        if (deletedInvoice) deleted = true;
      } catch (dbErr) {
        console.warn("MongoDB deleteInvoice warning:", dbErr.message);
      }
    }

    if (!deleted) {
      const idx = inMemoryBills.findIndex(
        (b) => String(b._id) === String(id) && String(b.userId) === String(req.userId)
      );
      if (idx >= 0) {
        inMemoryBills.splice(idx, 1);
        deleted = true;
      }
    }

    if (!deleted) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    res.status(200).json({ message: "Invoice deleted successfully" });
  } catch (error) {
    console.error("Failed to delete invoice:", error);
    res.status(500).json({ message: "Failed to delete invoice" });
  }
};

module.exports = { generateBill, getAllInvoices, downloadInvoicePDF, deleteInvoice };
