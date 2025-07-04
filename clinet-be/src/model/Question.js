const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  content: String,
  options: [String],
  correctAnswer: Number,
  explanation: String,
  subject: String,
  level: String,
   duration: Number, 
  createdAt: { type: Date, default: Date.now }
});

// ĐĂNG KÝ MODEL
module.exports = mongoose.model("Question", questionSchema);
