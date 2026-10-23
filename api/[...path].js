const app = require("../server/server");

// Export Express app as a Vercel Serverless Function
module.exports = (req, res) => {
  // Restore original request path if Vercel rewrite altered req.url
  const matchedPath = req.headers["x-matched-path"] || req.headers["x-vercel-matched-path"];
  if (matchedPath && matchedPath.startsWith("/api")) {
    const queryIndex = req.url.indexOf("?");
    const query = queryIndex !== -1 ? req.url.substring(queryIndex) : "";
    req.url = matchedPath + query;
  }
  return app(req, res);
};
