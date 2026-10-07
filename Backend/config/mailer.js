const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "htvsojitra@gmail.com",
    pass: process.env.EMAIL_PASS || "lzfv epti ovfv ztbe"
  }
});

module.exports = transporter;