  const express = require("express");
  const router = express.Router();
  const { submitExam } = require("../controllers/resultController");
  const Result = require("../model/Result");
  const Exam = require("../model/Exam");
  /**
   * @swagger
   * /result/submit:
   *   post:
   *     summary: Nộp bài thi và chấm điểm
   *     tags: [Result]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               userId:
   *                 type: string
   *               examId:
   *                 type: string
   *               answers:
   *                 type: array
   *                 items:
   *                   type: object
   *                   properties:
   *                     questionId:
   *                       type: string
   *                     selected:
   *                       type: integer
   *     responses:
   *       200:
   *         description: Trả về kết quả chấm điểm
   */




  /**
   * @route GET /results/:userId
   * @desc Lấy toàn bộ kết quả làm bài của user
   */
  router.get("/results/:userId", async (req, res) => {
    try {
      const results = await Result.find({ userId: req.params.userId })
        .populate("examId", "title code timeLimit")
        .sort({ submittedAt: -1 });

      const total = results.length;
      const totalScore = results.reduce((acc, r) => acc + r.score, 0);
      const average = total > 0 ? (totalScore / total).toFixed(2) : 0;

      res.status(200).json({
        total,
        average,
        results
      });
    } catch (err) {
      res.status(500).json({ message: "Lỗi khi lấy lịch sử kết quả" });
    }
  });

  router.post("/submit", submitExam);
  module.exports = router;




