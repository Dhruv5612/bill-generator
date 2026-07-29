require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const connectDB = require("./config/db.config");

const app = express();
const PORT = process.env.PORT || 5000;

const billGenerateRoute = require("./routes/billgenerator.route");
const authRoute = require("./routes/auth.route");

// Middleware
app.use(cors());
app.use(bodyParser.json());

app.use("/api", billGenerateRoute);
app.use("/api/auth", authRoute);

connectDB();

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server is running at PORT ${PORT}`);
  });
}

module.exports = app;
