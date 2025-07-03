const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ⚠ Sửa lại dòng này nếu bạn đang export trực tiếp model
const User = require("../model/userBE");
const { Admin } = require("../model/adminBe");

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Kiểm tra thiếu đầu vào
    if (!username || !password) {
      return res.status(400).json({ message: "Thiếu thông tin đăng nhập" });
    }

    let role = null;
    let account = await User.findOne({ username });

    if (account) {
      role = "user";

      // ✅ Kiểm tra trạng thái user
      if (account.status === "inactive") {
        return res.status(403).json({ message: "Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên." });
      }

    } else {
      account = await Admin.findOne({ username });

      if (!account) {
        return res.status(404).json({ message: "Không tìm thấy tài khoản" });
      }

      role = "admin";
      // 👉 Nếu bạn **muốn** kiểm tra status cho admin thì thêm đoạn này
      // if (account.status === "inactive") {
      //   return res.status(403).json({ message: "Admin đã bị khóa" });
      // }
    }

    // So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Sai mật khẩu" });
    }

    // Sinh token
    const token = jwt.sign(
      { userId: account._id, role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Trả về thông tin
    res.status(200).json({
      message: "Đăng nhập thành công",
      token,
      role,
      userId: account._id
    });

  } catch (error) {
    console.error("❌ Lỗi đăng nhập:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

module.exports = { login };
