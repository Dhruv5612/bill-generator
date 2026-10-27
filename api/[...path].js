const app = require("../server/server");

// Export Express app as a Vercel Serverless Function
module.exports = (req, res) => {
  return app(req, res);
};

