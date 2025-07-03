const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // 👈 Đảm bảo đúng tên model User (có thể là "userBE" nếu bạn đặt như vậy)
    required: true
  },
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Exam",
    required: true
  },
  score: Number,
  answers: [
    {
      questionId: mongoose.Schema.Types.ObjectId,
      selected: Number,
      isCorrect: Boolean
    }
  ],
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Result", resultSchema);
