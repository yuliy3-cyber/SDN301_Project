import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Button, Card, List, Space, Typography, Divider, Tag, Row, Col,
  Input, Select, Radio, message, notification, Modal
} from "antd";
import {
  PlusOutlined, BookOutlined, CheckCircleOutlined, EditOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

axios.defaults.baseURL = "http://localhost:9999";

const CreateQuestion = () => {
  const [formData, setFormData] = useState({
    content: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    explanation: "",
    subject: "",
    level: "easy"
  });

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/admin/questions");
      setQuestions(res.data);
    } catch (err) {
      message.error("❌ Không thể tải danh sách câu hỏi");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      content: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      explanation: "",
      subject: "",
      level: "easy"
    });
    setErrors({});
    setEditingQuestion(null);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.content.trim()) newErrors.content = "Vui lòng nhập nội dung câu hỏi!";
    if (!formData.subject.trim()) newErrors.subject = "Vui lòng nhập chủ đề!";
    if (!formData.explanation.trim()) newErrors.explanation = "Vui lòng nhập giải thích!";
    formData.options.forEach((opt, i) => {
      if (!opt.trim()) newErrors[`option${i}`] = `Vui lòng nhập đáp án ${i + 1}`;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData((prev) => ({ ...prev, options: newOptions }));
    if (errors[`option${index}`]) {
      setErrors((prev) => ({ ...prev, [`option${index}`]: undefined }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      if (editingQuestion) {
        await axios.put(`/admin/questions/${editingQuestion}`, formData);
        notification.success({
          message: "✏️ Cập nhật câu hỏi thành công",
          placement: "topRight",
        });
      } else {
        await axios.post("/admin/questions", formData);
        notification.success({
          message: "✅ Tạo câu hỏi thành công",
          placement: "topRight",
        });
      }
      resetForm();
      setIsModalVisible(false);
      fetchQuestions();
    } catch (err) {
      message.error("❌ Lỗi xử lý câu hỏi");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Bạn có chắc chắn muốn xóa câu hỏi này?",
      content: "Thao tác này sẽ không thể hoàn tác.",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await axios.delete(`/admin/questions/${id}`);
          notification.success({
            message: "🗑️ Đã xóa câu hỏi",
            placement: "topRight"
          });
          fetchQuestions();
        } catch (err) {
          message.error("❌ Lỗi khi xóa câu hỏi");
        }
      }
    });
  };

  const getDifficultyColor = (level) => {
    switch (level) {
      case "easy": return "green";
      case "medium": return "orange";
      case "hard": return "red";
      default: return "blue";
    }
  };

  const getDifficultyText = (level) => {
    switch (level) {
      case "easy": return "Dễ";
      case "medium": return "Trung bình";
      case "hard": return "Khó";
      default: return level;
    }
  };

  const groupBySubject = (data) => {
    return data.reduce((acc, q) => {
      const subject = q.subject || "Chưa phân loại";
      if (!acc[subject]) acc[subject] = [];
      acc[subject].push(q);
      return acc;
    }, {});
  };

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <Title level={2}><EditOutlined /> Tạo câu hỏi mới</Title>

      {/* --- FORM TẠO MỚI --- */}
      <Card title={<Space><PlusOutlined /> <span>Thông tin câu hỏi</span></Space>} style={{ marginBottom: "24px" }}>
        <div style={{ marginBottom: "16px" }}>
          <Text strong>Nội dung câu hỏi *</Text>
          <TextArea
            rows={3}
            placeholder="Nhập nội dung câu hỏi..."
            value={formData.content}
            onChange={(e) => handleInputChange("content", e.target.value)}
            style={{ marginTop: "8px", borderColor: errors.content ? "#ff4d4f" : undefined }}
          />
          {errors.content && <Text type="danger">{errors.content}</Text>}
        </div>

        <Row gutter={16}>
          <Col span={12}>
            <Text strong>Chủ đề *</Text>
            <Input
              value={formData.subject}
              onChange={(e) => handleInputChange("subject", e.target.value)}
              placeholder="VD: JS, React"
              style={{ marginTop: "8px", borderColor: errors.subject ? "#ff4d4f" : undefined }}
            />
            {errors.subject && <Text type="danger">{errors.subject}</Text>}
          </Col>
          <Col span={12}>
            <Text strong>Độ khó *</Text>
            <Select
              value={formData.level}
              onChange={(value) => handleInputChange("level", value)}
              style={{ width: "100%", marginTop: "8px" }}
            >
              <Option value="easy">Dễ</Option>
              <Option value="medium">Trung bình</Option>
              <Option value="hard">Khó</Option>
            </Select>
          </Col>
        </Row>

        <Title level={4} style={{ marginTop: "24px" }}>Các đáp án</Title>
        <Row gutter={16}>
          {[0, 1, 2, 3].map((i) => (
            <Col span={12} key={i}>
              <Text strong>Đáp án {i + 1} *</Text>
              <Input
                value={formData.options[i]}
                onChange={(e) => handleOptionChange(i, e.target.value)}
                placeholder={`Nhập đáp án ${i + 1}`}
                style={{ marginTop: "8px", borderColor: errors[`option${i}`] ? "#ff4d4f" : undefined }}
              />
              {errors[`option${i}`] && <Text type="danger">{errors[`option${i}`]}</Text>}
            </Col>
          ))}
        </Row>

        <div style={{ marginTop: "24px" }}>
          <Text strong>Đáp án đúng *</Text>
          <Radio.Group
            value={formData.correctAnswer}
            onChange={(e) => handleInputChange("correctAnswer", e.target.value)}
          >
            <Space direction="vertical">
              {[0, 1, 2, 3].map((i) => (
                <Radio key={i} value={i}>Đáp án {i + 1}</Radio>
              ))}
            </Space>
          </Radio.Group>
        </div>

        <div style={{ marginTop: "24px" }}>
          <Text strong>Giải thích *</Text>
          <TextArea
            rows={3}
            placeholder="Nhập lời giải thích..."
            value={formData.explanation}
            onChange={(e) => handleInputChange("explanation", e.target.value)}
            style={{ marginTop: "8px", borderColor: errors.explanation ? "#ff4d4f" : undefined }}
          />
          {errors.explanation && <Text type="danger">{errors.explanation}</Text>}
        </div>

        <Button
          type="primary"
          size="large"
          loading={submitting}
          icon={<PlusOutlined />}
          style={{ marginTop: "16px" }}
          onClick={handleSubmit}
        >
          Tạo câu hỏi
        </Button>
      </Card>

      <Divider />

      {/* --- DANH SÁCH CÂU HỎI THEO CHỦ ĐỀ --- */}
      <Title level={3}><BookOutlined /> Danh sách chủ đề</Title>

      {!selectedSubject ? (
        <Row gutter={[16, 16]}>
          {Object.keys(groupBySubject(questions)).map((subject) => (
            <Col span={6} key={subject}>
              <Card
                hoverable
                onClick={() => setSelectedSubject(subject)}
                style={{ textAlign: "center", cursor: "pointer" }}
              >
                <Text strong style={{ fontSize: "16px" }}>📘 {subject}</Text>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <>
          <Space style={{ marginBottom: "16px" }}>
            <Button onClick={() => setSelectedSubject(null)}>⬅ Quay lại</Button>
            <Title level={4} style={{ margin: 0 }}>📘 {selectedSubject}</Title>
          </Space>

          <List
            loading={loading}
            dataSource={groupBySubject(questions)[selectedSubject]}
            renderItem={(q, index) => (
              <List.Item>
                <Card size="small" style={{ width: "100%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <Text strong>{index + 1}. {q.content}</Text>
                    <Space>
                      <Tag color={getDifficultyColor(q.level)}>{getDifficultyText(q.level)}</Tag>
                      <Button
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => {
                          setFormData({
                            content: q.content,
                            options: q.options,
                            correctAnswer: q.correctAnswer,
                            explanation: q.explanation,
                            subject: q.subject,
                            level: q.level
                          });
                          setEditingQuestion(q._id);
                          setIsModalVisible(true);
                        }}
                      >Sửa</Button>
                      <Button
                        size="small"
                        danger
                        onClick={() => handleDelete(q._id)}
                      >Xoá</Button>
                    </Space>
                  </div>
                  <ul style={{ paddingLeft: "20px", marginTop: "10px" }}>
                    {q.options.map((opt, i) => (
                      <li key={i} style={{
                        color: q.correctAnswer === i ? "#52c41a" : undefined,
                        fontWeight: q.correctAnswer === i ? "bold" : undefined
                      }}>
                        {q.correctAnswer === i && <CheckCircleOutlined style={{ marginRight: 6 }} />}
                        {opt}
                      </li>
                    ))}
                  </ul>
                  <p><Text strong>Giải thích:</Text> <Text italic>{q.explanation}</Text></p>
                </Card>
              </List.Item>
            )}
          />
        </>
      )}

      {/* --- MODAL CHỈNH SỬA --- */}
      <Modal
        title="✏️ Chỉnh sửa câu hỏi"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          resetForm();
        }}
        onOk={handleSubmit}
        okText="Cập nhật"
        cancelText="Hủy"
        confirmLoading={submitting}
        width={800}
      >
        {/* Nội dung giống form tạo, có thể dùng component tái sử dụng nếu muốn DRY */}
        <div style={{ marginBottom: "16px" }}>
          <Text strong>Nội dung câu hỏi *</Text>
          <TextArea
            rows={3}
            placeholder="Nhập nội dung câu hỏi..."
            value={formData.content}
            onChange={(e) => handleInputChange("content", e.target.value)}
            style={{ marginTop: "8px", borderColor: errors.content ? "#ff4d4f" : undefined }}
          />
          {errors.content && <Text type="danger">{errors.content}</Text>}
        </div>

        <Row gutter={16}>
          <Col span={12}>
            <Text strong>Chủ đề *</Text>
            <Input
              placeholder="VD: React, JS, HTML"
              value={formData.subject}
              onChange={(e) => handleInputChange("subject", e.target.value)}
              style={{ marginTop: "8px", borderColor: errors.subject ? "#ff4d4f" : undefined }}
            />
            {errors.subject && <Text type="danger">{errors.subject}</Text>}
          </Col>
          <Col span={12}>
            <Text strong>Độ khó *</Text>
            <Select
              value={formData.level}
              onChange={(value) => handleInputChange("level", value)}
              style={{ width: "100%", marginTop: "8px" }}
            >
              <Option value="easy">Dễ</Option>
              <Option value="medium">Trung bình</Option>
              <Option value="hard">Khó</Option>
            </Select>
          </Col>
        </Row>

        <Title level={5} style={{ marginTop: "24px" }}>Các đáp án</Title>
        <Row gutter={16}>
          {[0, 1, 2, 3].map((i) => (
            <Col span={12} key={i}>
              <Text strong>Đáp án {i + 1} *</Text>
              <Input
                value={formData.options[i]}
                onChange={(e) => handleOptionChange(i, e.target.value)}
                placeholder={`Nhập đáp án ${i + 1}`}
                style={{ marginTop: "8px", borderColor: errors[`option${i}`] ? "#ff4d4f" : undefined }}
              />
              {errors[`option${i}`] && <Text type="danger">{errors[`option${i}`]}</Text>}
            </Col>
          ))}
        </Row>

        <div style={{ marginTop: "24px" }}>
          <Text strong>Đáp án đúng *</Text>
          <Radio.Group
            value={formData.correctAnswer}
            onChange={(e) => handleInputChange("correctAnswer", e.target.value)}
          >
            <Space direction="vertical">
              {[0, 1, 2, 3].map((i) => (
                <Radio key={i} value={i}>Đáp án {i + 1}</Radio>
              ))}
            </Space>
          </Radio.Group>
        </div>

        <div style={{ marginTop: "24px" }}>
          <Text strong>Giải thích *</Text>
          <TextArea
            rows={3}
            placeholder="Nhập lời giải thích..."
            value={formData.explanation}
            onChange={(e) => handleInputChange("explanation", e.target.value)}
            style={{ marginTop: "8px", borderColor: errors.explanation ? "#ff4d4f" : undefined }}
          />
          {errors.explanation && <Text type="danger">{errors.explanation}</Text>}
        </div>
      </Modal>
    </div>
  );
};

export default CreateQuestion;
