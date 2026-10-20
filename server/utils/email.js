const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, text }) => {
  try {
    // If credentials are provided in .env, use them. 
    // Otherwise, log the email to console for development.
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const transporter = nodemailer.createTransport({
        service: "gmail", // Assuming gmail for now, can be configured in env
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Email sent to ${to}`);
    } else {
      console.log("--------------------------------------------------");
      console.log("EMAIL MOCK (No EMAIL_USER/EMAIL_PASS in .env)");
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Text:\n${text}`);
      console.log("--------------------------------------------------");
    }
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Could not send email.");
  }
};

module.exports = sendEmail;
