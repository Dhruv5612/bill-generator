let app;
let loadError = null;

try {
  app = require("../server/server");
} catch (error) {
  loadError = error;
  console.error("FATAL: Failed to load Express app in serverless function:", error);
}

module.exports = (req, res) => {
  if (loadError || !app) {
    console.error("Serverless invocation error:", loadError);
    return res.status(500).json({
      status: "error",
      message: "Server failed to initialize",
      details: loadError ? loadError.message : "Unknown error",
    });
  }

  // Ensure request is passed to Express
  return app(req, res);
};
