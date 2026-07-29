const mongoose = require("mongoose");

const BillItemSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  hsnSac: { type: String },
  qty: { type: Number, required: true },
  unit: { type: String, required: true }, // e.g., Ton, Kg, Pcs
  rate: { type: Number, required: true },
  gstPercent: { type: Number, required: true },
  amount: { type: Number, required: true },
});

const BillSchema = new mongoose.Schema({
  // Company Info
  companyName: { type: String, required: true },
  companyAddress: { type: String, required: true },
  companyEmail: { type: String },
  companyMobile: { type: String },
  companyPAN: { type: String },
  companyGSTIN: { type: String },

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
  invoiceNumber: { type: String, required: true, unique: true },
  billDate: { type: String, required: true },
  email: { type: String }, // For sending the email

  // Items
  items: [BillItemSchema],

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
