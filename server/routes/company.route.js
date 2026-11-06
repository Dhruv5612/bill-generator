const express = require("express");
const router = express.Router();
const { getCompanies, saveCompany, deleteCompany } = require("../controllers/company.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.use(authMiddleware);

router.get("/", getCompanies);
router.post("/", saveCompany);
router.delete("/", deleteCompany);

module.exports = router;

