const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: { type: String, enum: ["user", "admin"], default: "user" }, // ✅ Sửa chỗ này
  email: String,
  phone: String,
  address: String,
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.User || mongoose.model("User", userSchema, "user");
