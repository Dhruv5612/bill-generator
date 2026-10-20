const express = require("express");
const { generateBill, getAllInvoices, downloadInvoicePDF, deleteInvoice } = require("../controllers/billgenerator.controller");
const authMiddleware = require("../middleware/auth.middleware");
const router = express.Router();

router.use(authMiddleware);
router.route("/generate-bill").post(generateBill);
router.route("/invoices").get(getAllInvoices);
router.route("/invoices/:id/download").get(downloadInvoicePDF);
router.route("/invoices/:id").delete(deleteInvoice);

module.exports = router;
