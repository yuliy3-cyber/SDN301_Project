const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/userBE");

const register = async (req, res) => {
  try {
    const { username, password, fullName, email } = req.body;

    if (!username || !password || !fullName || !email) {
      return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: "Tên đăng nhập đã tồn tại" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      password: hashedPassword,
      fullName,
      email,
      status: "active"
    });

    await newUser.save();

    const token = jwt.sign(
      { userId: newUser._id, role: "user" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      message: "Đăng ký thành công",
      token,
      role: "user",
      userId: newUser._id
    });

  } catch (error) {
    console.error("❌ Lỗi đăng ký:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

module.exports = { register };
