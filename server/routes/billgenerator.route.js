const express = require("express");
const { generateBill, getAllInvoices, downloadInvoicePDF, deleteInvoice } = require("../controllers/billgenerator.controller");
const router = express.Router();

router.route("/generate-bill").post(generateBill);
router.route("/invoices").get(getAllInvoices);
router.route("/invoices/:id/download").get(downloadInvoicePDF);
router.route("/invoices/:id").delete(deleteInvoice);

module.exports = router;
