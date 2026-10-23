const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const connectDB = require("./config/db.config");

const app = express();
const PORT = process.env.PORT || 5000;

const billGenerateRoute = require("./routes/billgenerator.route");
const authRoute = require("./routes/auth.route");

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json());

// Database connection middleware for serverless invocations
app.use(async (req, res, next) => {
  // Allow health check to succeed or report status without failing request immediately
  if (req.path === "/api/health" || req.path === "/health" || req.url.includes("health")) {
    return next();
  }
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("Database connection middleware error:", err.message);
    return res.status(500).json({
      message: "Database connection failed. Please check MONGODB_URI and MongoDB Atlas Network IP Whitelist (0.0.0.0/0).",
      error: err.message,
    });
  }
});

// Health check endpoint for verifying deployment & DB status
app.get(["/api/health", "/health"], async (req, res) => {
  let dbStatus = "disconnected";
  try {
    await connectDB();
    dbStatus = "connected";
  } catch (err) {
    dbStatus = "error: " + err.message;
  }
  res.status(200).json({
    status: "ok",
    message: "Billing System API is operational",
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

app.get(["/api", "/"], (req, res) => {
  res.status(200).json({ message: "Billing System API is running" });
});

app.use(["/api/auth", "/auth"], authRoute);
app.use(["/api", "/"], billGenerateRoute);

// Connect once on initialization in local/traditional servers
connectDB().catch((err) => console.error("Initial DB connect error:", err.message));

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server is running at PORT ${PORT}`);
  });
}

module.exports = app;
