const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,      // smtp-relay.brevo.com
  port: process.env.SMTP_PORT,      // 587
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.verify((err) => {
  if (err) {
    console.error("❌ Brevo SMTP error:", err);
  } else {
    console.log("✅ Brevo SMTP ready");
  }
});

const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: `"StickToon" <${process.env.FROM_EMAIL}>`,
    to,
    subject,
    html,
  });
};

module.exports = sendEmail;
