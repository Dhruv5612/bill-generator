const mongoose = require("mongoose");

let cachedConnection = null;

const connectDB = async () => {
  // Reuse existing connection if open
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  if (cachedConnection) {
    return cachedConnection;
  }

  const MongoURI = process.env.MONGODB_URI;
  if (!MongoURI) {
    console.warn("MONGODB_URI is not defined in environment variables!");
    throw new Error("MONGODB_URI environment variable is not defined");
  }

  try {
    cachedConnection = await mongoose.connect(MongoURI, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log("Connected to MongoDB successfully");
    return cachedConnection;
  } catch (error) {
    cachedConnection = null;
    console.error("Database connection unsuccessful:", error.message);
    throw error;
  }
};

module.exports = connectDB;

