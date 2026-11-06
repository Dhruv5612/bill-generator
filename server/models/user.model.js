const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationOtp: {
      type: String,
    },
    otpExpiresAt: {
      type: Date,
    },
    companies: [
      {
        companyName: { type: String, required: true },
        companyAddress: { type: String, default: "" },
        companyEmail: { type: String, default: "" },
        companyMobile: { type: String, default: "" },
        companyPAN: { type: String, default: "" },
        companyGSTIN: { type: String, default: "" },
        bankName: { type: String, default: "" },
        bankAcNo: { type: String, default: "" },
        bankIFSC: { type: String, default: "" },
        isProtected: { type: Boolean, default: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
