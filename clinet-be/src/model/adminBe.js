// model/adminBE.js
const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: { type: String, enum: ["admin"], default: "admin" },
  email: String,
  phone: String,
  createdAt: { type: Date, default: Date.now }
});

const Admin = mongoose.models.Admin || mongoose.model("Admin", adminSchema, "admin");

module.exports = { Admin };
