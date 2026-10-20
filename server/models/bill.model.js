const mongoose = require("mongoose");

const BillItemSchema = new mongoose.Schema({
  productName: { type: String, default: "" },
  hsnSac: { type: String, default: "" },
  qty: { type: Number, default: 0 },
  unit: { type: String, default: "Pcs" }, // e.g., Ton, Kg, Pcs
  rate: { type: Number, default: 0 },
  gstPercent: { type: Number, default: 0 },
  amount: { type: Number, default: 0 },
});

const BillSchema = new mongoose.Schema({
  // Company Info
  companyName: { type: String, default: "" },
  companyAddress: { type: String, default: "" },
  companyEmail: { type: String, default: "" },
  companyMobile: { type: String, default: "" },
  companyPAN: { type: String, default: "" },
  companyGSTIN: { type: String, default: "" },

  // Bank Info
  bankName: { type: String },
  bankAcNo: { type: String },
  bankIFSC: { type: String },

  // Buyer Info
  buyerName: { type: String },
  buyerAddress: { type: String },
  buyerPlaceOfSupply: { type: String },
  buyerPAN: { type: String },
  buyerGSTIN: { type: String },

  // Ship To Info
  shipName: { type: String },
  shipAddress: { type: String },
  shipPlaceOfSupply: { type: String },
  shipPAN: { type: String },
  shipGSTIN: { type: String },

  // Transport Info
  transporter: { type: String },
  lrNo: { type: String },
  vehicleNo: { type: String },

  // General Info
  billType: { type: String, enum: ["sales", "purchase"], default: "sales" },
  vendorBillNo: { type: String, default: "" },
  vendorBillDate: { type: String, default: "" },
  supplierName: { type: String, default: "" },
  supplierAddress: { type: String, default: "" },
  supplierGSTIN: { type: String, default: "" },
  supplierPAN: { type: String, default: "" },
  supplierPlaceOfSupply: { type: String, default: "" },
  invoiceNumber: { type: String, required: true, unique: true },
  billDate: { type: String, required: true },
  email: { type: String }, // For sending the email

  // Items
  items: [BillItemSchema],

  // User
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // Calculations
  totalQty: { type: Number },
  subTotal: { type: Number },
  taxableAmount: { type: Number },
  cgst: { type: Number },
  sgst: { type: Number },
  roundOff: { type: Number },
  grandTotal: { type: Number, required: true },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Bill", BillSchema);
