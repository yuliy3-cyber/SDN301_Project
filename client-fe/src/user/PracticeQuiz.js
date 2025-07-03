import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  Radio,
  Button,
  Typography,
  Space,
  Progress,
  Result,
  Divider,
  Tag,
  Alert,
  Spin,
  Row,
  Col
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  TrophyOutlined,
  ReloadOutlined
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

const PracticeQuiz = () => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [showScore, setShowScore] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("http://localhost:9999/admin/questions");
      setQuestions(res.data);
    } catch (err) {
      setError("Không thể tải danh sách câu hỏi. Vui lòng thử lại!");
      console.error("Error fetching questions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (qid, selected) => {
    setAnswers({ ...answers, [qid]: selected });
  };

  const handleSubmit = () => {
    let correct = 0;
    questions.forEach((q) => {
      if (answers[q._id] === q.correctAnswer) correct++;
    });
    setScore(correct);
    setShowScore(true);
  };

  const handleRetry = () => {
    setAnswers({});
    setShowScore(false);
    setScore(0);
  };

  const getScoreStatus = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage >= 80) return "success";
    if (percentage >= 60) return "normal";
    return "exception";
  };

  const answeredCount = Object.keys(answers).length;
  const progressPercent =
    questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen w-screen bg-gray-50">
        <Spin size="large" tip="Đang tải câu hỏi...">
          <div className="p-20" />
        </Spin>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-screen bg-gray-50 flex items-center justify-center">
        <div className="w-full max-w-md">
          <Alert
            message="Lỗi tải dữ liệu"
            description={error}
            type="error"
            showIcon
            action={
              <Button size="small" danger onClick={fetchQuestions}>
                Thử lại
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-gray-50 overflow-auto">
      <div className="w-full h-full">
        {/* Header - Fixed at top */}
        <div className="sticky top-0 z-10 bg-white shadow-sm">
          <Card className="m-0 rounded-none border-0 border-b">
            <Row align="middle" justify="space-between">
              <Col>
                <Title level={2} className="mb-0">
                  📚 Ôn tập câu hỏi
                </Title>
                <Text type="secondary">
                  Tổng số câu hỏi: {questions.length}
                </Text>
              </Col>
              <Col>
                <Tag color="blue" className="text-sm">
                  Đã trả lời: {answeredCount}/{questions.length}
                </Tag>
              </Col>
            </Row>
            <Divider className="my-4" />
            <Progress
              percent={Math.round(progressPercent)}
              status={showScore ? getScoreStatus() : "active"}
              strokeColor={showScore ? undefined : "#1890ff"}
            />
          </Card>
        </div>

        {/* Content area - Full width scrollable */}
        <div className="p-4">
          {/* Kết quả */}
          {showScore && (
            <Card className="mb-4 w-full">
              <Result
                icon={
                  <TrophyOutlined
                    style={{
                      color:
                        score / questions.length >= 0.8
                          ? "#52c41a"
                          : score / questions.length >= 0.6
                          ? "#faad14"
                          : "#f5222d"
                    }}
                  />
                }
                title={
                  <Title level={3}>
                    🎉 Kết quả: {score}/{questions.length} câu đúng
                  </Title>
                }
                subTitle={
                  <Text>
                    Tỷ lệ chính xác: {Math.round((score / questions.length) * 100)}%
                  </Text>
                }
                extra={
                  <Button
                    type="primary"
                    icon={<ReloadOutlined />}
                    onClick={handleRetry}
                  >
                    Làm lại
                  </Button>
                }
              />
            </Card>
          )}

          {/* Danh sách câu hỏi */}
          <Space direction="vertical" size="large" className="w-full">
            {questions.map((q, idx) => (
              <Card
                key={q._id}
                className={`w-full shadow-md ${
                  showScore
                    ? answers[q._id] === q.correctAnswer
                      ? "border-green-300 bg-green-50"
                      : "border-red-300 bg-red-50"
                    : ""
                }`}
                title={
                  <Space>
                    <Tag color="blue">Câu {idx + 1}</Tag>
                    {showScore &&
                      (answers[q._id] === q.correctAnswer ? (
                        <CheckCircleOutlined style={{ color: "#52c41a" }} />
                      ) : (
                        <CloseCircleOutlined style={{ color: "#f5222d" }} />
                      ))}
                  </Space>
                }
              >
                <Paragraph strong className="text-base mb-4">
                  {q.content}
                </Paragraph>

                <Radio.Group
                  value={answers[q._id]}
                  onChange={(e) => handleChange(q._id, e.target.value)}
                  disabled={showScore}
                  className="w-full"
                >
                  <Space direction="vertical" size="middle" className="w-full">
                    {q.options.map((opt, i) => (
                      <Radio
                        key={i}
                        value={i}
                        className={
                          showScore && i === q.correctAnswer
                            ? "text-green-600 font-medium"
                            : showScore &&
                              answers[q._id] === i &&
                              i !== q.correctAnswer
                            ? "text-red-600"
                            : ""
                        }
                      >
                        {opt}
                        {showScore && i === q.correctAnswer && (
                          <Tag color="success" size="small" className="ml-2">
                            Đáp án đúng
                          </Tag>
                        )}
                      </Radio>
                    ))}
                  </Space>
                </Radio.Group>

                {showScore && answers[q._id] !== q.correctAnswer && (
                  <Alert
                    message="Sai rồi!"
                    description={`Đáp án đúng là: ${q.options[q.correctAnswer]}`}
                    type="error"
                    showIcon
                    className="mt-4"
                  />
                )}
              </Card>
            ))}
          </Space>

          {/* Nút chấm điểm - Sticky at bottom */}
          {!showScore && (
            <div className="sticky bottom-0 bg-white border-t p-4 mt-6">
              <Card className="text-center m-0">
                <Button
                  type="primary"
                  size="large"
                  onClick={handleSubmit}
                  disabled={answeredCount === 0}
                  className="px-8"
                >
                  Chấm điểm
                </Button>
                <div className="mt-2">
                  <Text type="secondary">
                    {answeredCount === 0
                      ? "Vui lòng trả lời ít nhất 1 câu hỏi"
                      : `Bạn có thể chấm điểm với ${answeredCount} câu đã trả lời`}
                  </Text>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PracticeQuiz;