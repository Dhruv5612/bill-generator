const Bill = require("../models/bill.model");
const nodemailer = require("nodemailer");
const { generatePDF } = require("../utils/pdfgenerator.util");

const generateBill = async (req, res) => {
  try {
    const billData = req.body;

    const existingBill = await Bill.findOne({
      invoiceNumber: billData.invoiceNumber,
    });
    if (existingBill) {
      return res
        .status(400)
        .json({ message: "Invoice number already exists. Please try again." });
    }

    // Save to MongoDB
    const newBill = new Bill(billData);
    await newBill.save();

    // Generate PDF
    const pdfBuffer = await generatePDF(billData);

    // Try to send Email in background (non-blocking)
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      transporter.sendMail({
        from: `"${billData.companyName || 'Invoice Generator'}" <${process.env.EMAIL_USER}>`,
        to: billData.email,
        subject: `Invoice ${billData.invoiceNumber || ''} from ${billData.companyName || 'Us'}`,
        text: "Please find your attached invoice.",
        attachments: [
          {
            filename: `Invoice_${billData.invoiceNumber || 'document'}.pdf`,
            content: pdfBuffer,
          },
        ],
      }).then(() => console.log("Email sent successfully."))
        .catch((err) => console.error("Email failed:", err.message));
    } catch (emailError) {
      console.error("Failed to configure email:", emailError.message);
    }

    // Return the PDF buffer directly to the client
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Invoice_${billData.invoiceNumber || "document"}.pdf`
    );
    res.status(200).send(pdfBuffer);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};

const getAllInvoices = async (req, res) => {
  try {
    const invoices = await Bill.find().sort({ _id: -1 });
    res.status(200).json(invoices);
  } catch (error) {
    console.error("Failed to fetch invoices:", error);
    res.status(500).json({ message: "Failed to fetch invoices" });
  }
};

const downloadInvoicePDF = async (req, res) => {
  try {
    const { id } = req.params;
    const invoiceData = await Bill.findById(id);
    if (!invoiceData) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    
    // Generate PDF using existing util
    const pdfBuffer = await generatePDF(invoiceData);
    
    // Return the PDF buffer directly
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Invoice_${invoiceData.invoiceNumber || "document"}.pdf`
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
    const deletedInvoice = await Bill.findByIdAndDelete(id);
    if (!deletedInvoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    res.status(200).json({ message: "Invoice deleted successfully" });
  } catch (error) {
    console.error("Failed to delete invoice:", error);
    res.status(500).json({ message: "Failed to delete invoice" });
  }
};

module.exports = { generateBill, getAllInvoices, downloadInvoicePDF, deleteInvoice };
