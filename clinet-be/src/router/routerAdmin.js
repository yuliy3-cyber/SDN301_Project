const express = require("express");
const router = express.Router();
const Question = require("../model/Question");
const User = require("../model/userBE");

const Exam = require("../model/Exam");
const Result = require("../model/Result");
const { verifyToken, checkRole } = require("../middleware/auth");


// ============================================================
// 🧠 CÂU HỎI
// ============================================================

/**
 * @route GET /admin/questions
 * @desc Lấy danh sách toàn bộ câu hỏi
 */
router.get("/questions", async (req, res) => {
  try {
    const questions = await Question.find();
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lấy câu hỏi" });
  }
});

/**
 * @route POST /admin/questions
 * @desc Tạo câu hỏi mới
 */
router.patch("/user/:id", verifyToken, checkRole("admin"), async (req, res) => {
  try {
    const { status } = req.body;

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    res.status(200).json({ message: "✅ Đã cập nhật trạng thái", user });
  } catch (err) {
    console.error("❌ Lỗi cập nhật trạng thái:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});
router.post("/questions", async (req, res) => {
  try {
    const { content, options, correctAnswer, explanation, subject, level } = req.body;

    if (!content || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ message: "Thiếu dữ liệu hoặc sai định dạng" });
    }

    const newQuestion = new Question({
      content,
      options,
      correctAnswer,
      explanation,
      subject,
      level,
      createdAt: new Date()
    });

    await newQuestion.save();
    res.status(201).json({ message: "✅ Tạo câu hỏi thành công", question: newQuestion });
  } catch (err) {
    res.status(500).json({ message: "Lỗi tạo câu hỏi", error: err.message });
  }
});
/**
 * @route PUT /admin/questions/:id
 * @desc Cập nhật một câu hỏi
 */
router.put("/questions/:id", async (req, res) => {
  try {
    const { content, options, correctAnswer, explanation, subject, level } = req.body;

    const updated = await Question.findByIdAndUpdate(
      req.params.id,
      { content, options, correctAnswer, explanation, subject, level },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Không tìm thấy câu hỏi" });

    res.status(200).json({ message: "✅ Cập nhật câu hỏi thành công", question: updated });
  } catch (err) {
    res.status(500).json({ message: "Lỗi cập nhật câu hỏi", error: err.message });
  }
});
/**
 * @route DELETE /admin/questions/:id
 * @desc Xóa một câu hỏi
 */
router.delete("/questions/:id", async (req, res) => {
  try {
    const deleted = await Question.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Không tìm thấy câu hỏi" });

    res.status(200).json({ message: "✅ Đã xóa câu hỏi", id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi xóa câu hỏi", error: err.message });
  }
});

/**
 * @route GET /admin/questions/random?count=5
 * @desc Trả về ngẫu nhiên X câu hỏi
 */
router.get("/questions/random", verifyToken, checkRole("admin"), async (req, res) => {
  try {
    const count = parseInt(req.query.count) || 5;

    const questions = await Question.aggregate([
      { $sample: { size: count } } // Random count câu hỏi
    ]);

    res.status(200).json(questions);
  } catch (err) {
    console.error("❌ Lỗi random câu hỏi:", err.message);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});
/**
 * @route POST /admin/tests
 */
router.post("/tests", verifyToken, checkRole("admin"), async (req, res) => {
  try {
    const { title, description, code, duration, questionIds } = req.body;

    if (!title || !code || !Array.isArray(questionIds) || questionIds.length === 0) {
      return res.status(400).json({ message: "Thiếu dữ liệu hoặc sai định dạng" });
    }

    const examExists = await Exam.findOne({ code });
    if (examExists) {
      return res.status(400).json({ message: "Mã đề thi đã tồn tại" });
    }

    const newExam = new Exam({
      title,
      description,
      code,
      duration,
      questionIds
    });

    await newExam.save();

    res.status(201).json({ message: "✅ Tạo đề thi thành công", exam: newExam });
  } catch (err) {
    res.status(500).json({ message: "Lỗi tạo đề thi", error: err.message });
  }
});
/**
 * @route GET /admin/tests
 * @desc Lấy danh sách tất cả đề thi
 */
router.get("/tests", async (req, res) => {
  try {
    const exams = await Exam.find().sort({ createdAt: -1 });
    res.status(200).json(exams);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy danh sách đề thi" });
  }
});




// ============================================================
// 👤 TÀI KHOẢN
// ============================================================

/**
 * @route GET /admin/accounts
 * @desc Lấy danh sách tài khoản (Chỉ admin)
 */
// routes/admin.js




/**
 * @route GET /admin/user
 * @desc Lấy danh sách tất cả người dùng (cả user và admin)
 */
router.get("/user", verifyToken, checkRole("admin"), async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).select("-password");
    res.status(200).json(users);
  } catch (err) {
    console.error("❌ Lỗi lấy danh sách user:", err); // 👈 LOG CHI TIẾT LỖI
    res.status(500).json({ message: "Lỗi khi lấy danh sách người dùng", error: err.message });
  }
});


module.exports = router;



/**
 * @route GET /admin/user/:id
 * @desc Lấy thông tin một người dùng theo ID
 */
router.get("/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
});


// ============================================================
// 📘 ĐỀ THI
// ============================================================

/**
 * @route GET /admin/tests
 * @desc Lấy danh sách tất cả đề thi
 */
router.get("/tests", async (req, res) => {
  try {
    const exams = await Exam.find().populate("questionIds");
    res.status(200).json(exams);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy danh sách đề thi" });
  }
});

/**
 * @route POST /admin/tests
 * @desc Tạo đề thi mới
 */
router.post("/tests", async (req, res) => {
  try {
    const { title, description, code, duration, questionIds } = req.body;

    if (!title || !code || !Array.isArray(questionIds) || questionIds.length === 0) {
      return res.status(400).json({ message: "Thiếu dữ liệu hoặc sai định dạng" });
    }

    const examExists = await Exam.findOne({ code });
    if (examExists) {
      return res.status(400).json({ message: "Mã đề thi đã tồn tại" });
    }

    const newExam = new Exam({
      title,
      description,
      code,
      duration, // phút
      questionIds
    });

    await newExam.save();

    res.status(201).json({ message: "✅ Tạo đề thi thành công", exam: newExam });
  } catch (err) {
    res.status(500).json({ message: "Lỗi tạo đề thi", error: err.message });
  }
});

/**
 * @route GET /admin/exam/code/:code
 * @desc Lấy ID đề thi từ mã code
 */
router.get("/exam/code/:code", async (req, res) => {
  try {
    const exam = await Exam.findOne({ code: req.params.code });
    if (!exam) return res.status(404).json({ message: "Exam code không tồn tại" });

    res.status(200).json({ examId: exam._id });
  } catch (err) {
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
});

/**
 * @route GET /admin/exam/:id
 * @desc Lấy chi tiết đề thi theo ID
 */
router.get("/exam/:id", async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).populate("questionIds");

    if (!exam) return res.status(404).json({ message: "Không tìm thấy đề thi" });

    res.status(200).json({
      ...exam.toObject(),
      questions: exam.questionIds,
      duration: exam.duration
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi tải đề thi", error: err.message });
  }
});


// ============================================================
// 📊 THỐNG KÊ
// ============================================================

/**
 * @route GET /admin/results?code=REACT-MID
 * @desc Lấy danh sách học sinh đã làm bài theo mã đề
 */
router.get("/results", async (req, res) => {
  const { code } = req.query;

  try {
    const exam = await Exam.findOne({ code });
    if (!exam) return res.status(404).json({ message: "Không tìm thấy mã đề thi" });

    // 📌 Tự động join bảng User
    const results = await Result.find({ examId: exam._id })
      .populate("userId", "username email") // username + email từ bảng User
      .sort({ score: -1 });

    // ✅ Map dữ liệu gọn gàng
    const data = results.map((r) => ({
      userId: r.userId?._id || "Không có",
      username: r.userId?.username || "Không có",
      email: r.userId?.email || "Không có",
      score: r.score,
      submittedAt: r.submittedAt
    }));

    res.status(200).json({
      examTitle: exam.title,
      examCode: code,
      total: data.length,
      results: data
    });
  } catch (err) {
    console.error("❌ Lỗi khi truy xuất thống kê:", err.message);
    res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
  }
});
router.get("/result", async (req, res) => {
  try {
    const exams = await Exam.find().lean(); // lấy danh sách đề thi

    // Duyệt từng đề và đếm số kết quả
    const data = await Promise.all(
      exams.map(async (exam) => {
        const count = await Result.countDocuments({ examId: exam._id });
        return {
          _id: exam._id,
          title: exam.title,
          code: exam.code,
          totalResults: count,
        };
      })
    );

    res.status(200).json(data);
  } catch (err) {
    console.error("❌ Lỗi khi lấy danh sách kết quả:", err.message);
    res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
  }
});

// Thêm các route này vào file admin.js của bạn

/**
 * @route PUT /admin/tests/:id
 * @desc Cập nhật đề thi
 */
router.put("/tests/:id", verifyToken, checkRole("admin"), async (req, res) => {
  try {
    const { title, description, code, duration, questionIds } = req.body;

    if (!title || !code || !Array.isArray(questionIds) || questionIds.length === 0) {
      return res.status(400).json({ message: "Thiếu dữ liệu hoặc sai định dạng" });
    }

    // Kiểm tra mã đề thi có trùng với đề khác không (trừ đề hiện tại)
    const examExists = await Exam.findOne({ code, _id: { $ne: req.params.id } });
    if (examExists) {
      return res.status(400).json({ message: "Mã đề thi đã tồn tại" });
    }

    const updatedExam = await Exam.findByIdAndUpdate(
      req.params.id,
      { title, description, code, duration, questionIds },
      { new: true }
    );

    if (!updatedExam) {
      return res.status(404).json({ message: "Không tìm thấy đề thi" });
    }

    res.status(200).json({ message: "✅ Cập nhật đề thi thành công", exam: updatedExam });
  } catch (err) {
    console.error("❌ Lỗi cập nhật đề thi:", err);
    res.status(500).json({ message: "Lỗi cập nhật đề thi", error: err.message });
  }
});

/**
 * @route DELETE /admin/tests/:id
 * @desc Xóa đề thi
 */
router.delete("/tests/:id", verifyToken, checkRole("admin"), async (req, res) => {
  try {
    // Kiểm tra xem có kết quả nào liên quan đến đề thi này không
    const hasResults = await Result.findOne({ examId: req.params.id });
    if (hasResults) {
      return res.status(400).json({ 
        message: "Không thể xóa đề thi đã có học sinh làm bài" 
      });
    }

    const deletedExam = await Exam.findByIdAndDelete(req.params.id);
    if (!deletedExam) {
      return res.status(404).json({ message: "Không tìm thấy đề thi" });
    }

    res.status(200).json({ 
      message: "✅ Đã xóa đề thi thành công", 
      examId: req.params.id 
    });
  } catch (err) {
    console.error("❌ Lỗi xóa đề thi:", err);
    res.status(500).json({ message: "Lỗi xóa đề thi", error: err.message });
  }
});

/**
 * @route GET /admin/tests/:id
 * @desc Lấy chi tiết một đề thi để chỉnh sửa
 */
router.get("/tests/:id", verifyToken, checkRole("admin"), async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: "Không tìm thấy đề thi" });
    }

    res.status(200).json(exam);
  } catch (err) {
    console.error("❌ Lỗi lấy chi tiết đề thi:", err);
    res.status(500).json({ message: "Lỗi lấy chi tiết đề thi", error: err.message });
  }
});

/**
 * @route GET /admin/questions/search
 * @desc Tìm kiếm câu hỏi theo từ khóa, môn học, độ khó
 */
router.get("/questions/search", verifyToken, checkRole("admin"), async (req, res) => {
  try {
    const { keyword, subject, level, page = 1, limit = 20 } = req.query;
    
    let query = {};
    
    if (keyword) {
      query.content = { $regex: keyword, $options: 'i' };
    }
    
    if (subject) {
      query.subject = subject;
    }
    
    if (level) {
      query.level = level;
    }

    const skip = (page - 1) * limit;
    
    const questions = await Question.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Question.countDocuments(query);

    res.status(200).json({
      questions,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error("❌ Lỗi tìm kiếm câu hỏi:", err);
    res.status(500).json({ message: "Lỗi tìm kiếm câu hỏi", error: err.message });
  }
});

/**
 * @route GET /admin/questions/subjects
 * @desc Lấy danh sách môn học và độ khó để filter
 */
router.get("/questions/subjects", verifyToken, checkRole("admin"), async (req, res) => {
  try {
    const subjects = await Question.distinct("subject");
    const levels = await Question.distinct("level");
    
    res.status(200).json({ subjects, levels });
  } catch (err) {
    console.error("❌ Lỗi lấy danh sách môn học:", err);
    res.status(500).json({ message: "Lỗi lấy danh sách môn học", error: err.message });
  }
});



module.exports = router;
