const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: `"BillCraft Support" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text,
        html: html || text,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Email successfully sent to ${to}`);
    } else {
      console.log("--------------------------------------------------");
      console.log("EMAIL MOCK (No EMAIL_USER/EMAIL_PASS in .env)");
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Text:\n${text}`);
      console.log("--------------------------------------------------");
    }
  } catch (error) {
    console.error("Error sending email via nodemailer:", error.message);
  }
};

module.exports = sendEmail;
