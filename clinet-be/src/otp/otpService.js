const nodemailer = require('nodemailer');
require('dotenv').config();

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOTPEmail = async (toEmail, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: 'Mã xác thực OTP của bạn',
    text: `Mã OTP của bạn là: ${otp}. Mã có hiệu lực trong 5 phút.`,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { generateOTP, sendOTPEmail };
