const express = require("express");
const router = express.Router();
const { generateOTP, sendOTPEmail } = require("../otp/otpService");
const userBE = require("../model/userBE");
const bcrypt = require("bcryptjs");

const otpStore = new Map();

// 📌 1. Gửi OTP
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email là bắt buộc" });

  try {
    const user = await userBE.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email không tồn tại trong hệ thống" });
    }

    const otp = generateOTP();
    otpStore.set(email, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

    await sendOTPEmail(email, otp);
    return res.status(200).json({ message: "Mã OTP đã được gửi đến email" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Lỗi khi gửi OTP" });
  }
});

// 📌 2. Xác minh OTP
router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ message: "Thiếu email hoặc mã OTP" });
  }

  const record = otpStore.get(email);
  if (!record) {
    return res.status(400).json({ message: "Không tìm thấy OTP cho email này" });
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(email);
    return res.status(400).json({ message: "Mã OTP đã hết hạn" });
  }

  if (record.otp !== otp) {
    return res.status(400).json({ message: "Mã OTP không chính xác" });
  }

  return res.status(200).json({ message: "Xác thực OTP thành công" });
});

// 📌 3. Đặt lại mật khẩu mới
router.post("/reset-password", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Thiếu email hoặc mật khẩu mới" });
  }

  try {
    const user = await userBE.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email không tồn tại" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    otpStore.delete(email);
    return res.status(200).json({ message: "Đặt lại mật khẩu thành công" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Lỗi khi cập nhật mật khẩu" });
  }
});

module.exports = router;
