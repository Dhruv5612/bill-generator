const app = require("../server/server");

// Export Express app as a Vercel Serverless Function for all /api/* subroutes
module.exports = app;
