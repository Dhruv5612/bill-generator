module.exports = (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Serverless functions are working on Vercel!",
    timestamp: new Date().toISOString(),
  });
};
