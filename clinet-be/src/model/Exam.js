const mongoose = require("mongoose");

const examSchema = new mongoose.Schema({
  title: String,
  description: String,
  code: { type: String, unique: true }, // để user nhập code vào làm bài
  questionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
  duration: Number, // thời lượng tính bằng phút
  classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class" }, // liên kết lớp
  startTime: Date,  // thời gian bắt đầu mở thi (optional)
  endTime: Date,    // thời gian kết thúc thi (optional)
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Exam || mongoose.model("Exam", examSchema);
