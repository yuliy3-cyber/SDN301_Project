const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  fullName: String,
  role: { type: String, enum: ["user", "admin"], default: "user" }, // ✅ Sửa chỗ này
  email: { type: String, required: true, unique: true },
  phone: String,
  address: String,
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  createdAt: { type: Date, default: Date.now },
  avatar: { type: String, default: "" }
});

module.exports = mongoose.models.User || mongoose.model("User", userSchema, "user");
