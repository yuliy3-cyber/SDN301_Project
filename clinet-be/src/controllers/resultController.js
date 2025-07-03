const Result = require("../model/Result");
const Question = require("../model/Question");

const submitExam = async (req, res) => {
  try {
    const { userId, examId, answers } = req.body;

    let score = 0;
    const resultAnswers = [];

    for (const ans of answers) {
      const question = await Question.findById(ans.questionId);
      const isCorrect = question && question.correctAnswer === ans.selected;

      if (isCorrect) score += 1;

      resultAnswers.push({
        questionId: ans.questionId,
        selected: ans.selected,
        isCorrect: !!isCorrect
      });
    }

    const result = new Result({
      userId,
      examId,
      score,
      answers: resultAnswers,
      submittedAt: new Date()
    });

    await result.save();

    res.status(200).json({ message: "✅ Nộp bài thành công", score });
  } catch (error) {
    console.error("❌ Lỗi khi nộp bài:", error.message);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

module.exports = { submitExam };
