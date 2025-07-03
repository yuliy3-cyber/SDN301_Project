import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Card,
  Radio,
  Button,
  Typography,
  Space,
  Progress,
  Alert,
  Divider,
  Row,
  Col,
  Tag,
  Modal,
  Result,
  Spin,
  message
} from "antd";
import {
  ClockCircleOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  TrophyOutlined,
  SendOutlined,
  ExclamationCircleOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";



const { Title, Text, Paragraph } = Typography;
const { confirm } = Modal;

const TakeExam = () => {
  const { examId } = useParams();
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExam = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:9999/exam/${examId}`);
        setExam(res.data);

        const durationInSeconds = (res.data.duration || res.data.timeLimit || 30) * 60;
        setTimeLeft(durationInSeconds);
        message.success("Đã tải đề thi thành công!");
      } catch (err) {
        message.error("Không thể tải đề thi. Vui lòng thử lại!");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (examId) {
      fetchExam();
    }
  }, [examId]);

  // Timer countdown
  useEffect(() => {
    if (!timeLeft || score !== null) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, score]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getTimeColor = () => {
    if (!timeLeft) return "default";
    if (timeLeft < 300) return "error"; // < 5 phút
    if (timeLeft < 600) return "warning"; // < 10 phút
    return "success";
  };

  const getProgressPercent = () => {
    if (!exam || !timeLeft) return 0;
    const totalTime = (exam.duration || exam.timeLimit || 30) * 60;
    return Math.round(((totalTime - timeLeft) / totalTime) * 100);
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  const handleChange = (qid, optIdx) => {
    setAnswers({ ...answers, [qid]: optIdx });
  };

  const showSubmitConfirm = () => {
    const answeredCount = getAnsweredCount();
    const totalQuestions = exam?.questions?.length || 0;

    confirm({
      title: 'Xác nhận nộp bài',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>Bạn đã trả lời <strong>{answeredCount}/{totalQuestions}</strong> câu hỏi.</p>
          <p>Bạn có chắc chắn muốn nộp bài không?</p>
          {answeredCount < totalQuestions && (
            <p style={{ color: '#ff4d4f' }}>
              ⚠️ Bạn chưa trả lời hết tất cả câu hỏi!
            </p>
          )}
        </div>
      ),
      okText: 'Nộp bài',
      cancelText: 'Hủy',
      onOk() {
        handleSubmit(false);
      },
    });
  };

  const handleSubmit = async (autoSubmit = false) => {
    setSubmitting(true);

    const formattedAnswers = Object.entries(answers).map(([questionId, selected]) => ({
      questionId,
      selected
    }));

    try {
      const res = await axios.post("http://localhost:9999/result/submit", {
        userId,
        examId,
        answers: formattedAnswers
      });

      setScore(res.data.score);

      if (autoSubmit) {
        message.warning("⏰ Hết giờ! Bài thi đã được tự động nộp.");
      } else {
        message.success("✅ Nộp bài thành công!");
      }
    } catch (err) {
      message.error("Nộp bài thất bại. Vui lòng thử lại!");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '50vh'
      }}>
        <Spin size="large" tip="Đang tải đề thi..." />
      </div>
    );
  }

  if (!exam) {
    return (
      <Result
        status="404"
        title="Không tìm thấy đề thi"
        subTitle="Đề thi không tồn tại hoặc đã bị xóa."
        extra={<Button type="primary">Quay lại</Button>}
      />
    );
  }

  if (score !== null) {
    const getScoreStatus = () => {
      if (score >= 8) return { status: 'success', color: '#52c41a', label: 'Xuất sắc' };
      if (score >= 6.5) return { status: 'success', color: '#1890ff', label: 'Khá' };
      if (score >= 5) return { status: 'warning', color: '#faad14', label: 'Trung bình' };
      return { status: 'error', color: '#ff4d4f', label: 'Cần cố gắng' };
    };

    const scoreInfo = getScoreStatus();
    const answeredCount = getAnsweredCount();
    const totalQuestions = exam?.questions?.length || 0;
    const percentage = totalQuestions > 0 ? Math.round((score / 10) * 100) : 0;

    return (
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px' }}>
        <Card style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ padding: '40px 20px' }}>
            <TrophyOutlined
              style={{
                fontSize: '80px',
                color: scoreInfo.color,
                marginBottom: '24px',
                display: 'block'
              }}
            />
            <Title level={1} style={{ margin: '0 0 16px 0', color: scoreInfo.color }}>
              {score}/10
            </Title>
            <Title level={2} style={{ margin: '0 0 24px 0' }}>
              Hoàn thành bài thi!
            </Title>
            <Tag
              color={scoreInfo.status === 'error' ? 'red' : scoreInfo.status === 'warning' ? 'orange' : 'green'}
              style={{
                fontSize: '18px',
                padding: '8px 24px',
                borderRadius: '20px',
                marginBottom: '24px'
              }}
            >
              {scoreInfo.label} - {percentage}%
            </Tag>
            <Paragraph style={{ fontSize: '16px', color: '#666', marginTop: '16px' }}>
              Bạn đã hoàn thành bài thi <strong>{exam?.title}</strong>
            </Paragraph>
          </div>
        </Card>

        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} md={8}>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <CheckCircleOutlined
                  style={{ fontSize: '32px', color: '#52c41a', marginBottom: '12px' }}
                />
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#262626' }}>
                  {answeredCount}/{totalQuestions}
                </div>
                <div style={{ color: '#8c8c8c' }}>Câu đã trả lời</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <ClockCircleOutlined
                  style={{ fontSize: '32px', color: '#1890ff', marginBottom: '12px' }}
                />
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#262626' }}>
                  {exam?.duration || exam?.timeLimit || 0}
                </div>
                <div style={{ color: '#8c8c8c' }}>Phút làm bài</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <TrophyOutlined
                  style={{ fontSize: '32px', color: scoreInfo.color, marginBottom: '12px' }}
                />
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: scoreInfo.color }}>
                  {percentage}%
                </div>
                <div style={{ color: '#8c8c8c' }}>Tỷ lệ đúng</div>
              </div>
            </Card>
          </Col>
        </Row>

        <Card>
          <div style={{ textAlign: "center" }}>
            <Space size="middle">
              <Button
                type="primary"
                size="large"
                icon={<FileTextOutlined />}
                onClick={() => navigate("/user/results")} // thay bằng ID thật nếu có
              >
                Xem kết quả bài thi
              </Button>

              <Button
                size="large"
                onClick={() => navigate("/user")}
              >
                Quay lại trang chủ
              </Button>
            </Space>
          </div>
        </Card>

      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px' }}>
      {/* Header */}
      <Card style={{ marginBottom: 24 }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Space direction="vertical" size={0}>
              <Title level={2} style={{ margin: 0 }}>
                <FileTextOutlined /> {exam.title}
              </Title>
              {exam.description && (
                <Text type="secondary">{exam.description}</Text>
              )}
            </Space>
          </Col>
          <Col>
            <Space direction="vertical" align="end" size={0}>
              <Tag
                color={getTimeColor()}
                style={{ fontSize: '16px', padding: '8px 16px' }}
              >
                <ClockCircleOutlined /> {formatTime(timeLeft)}
              </Tag>
              <Text type="secondary">
                Thời gian: {exam.duration || exam.timeLimit} phút
              </Text>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Progress */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={24}>
          <Col span={12}>
            <div>
              <Text strong>Tiến độ thời gian:</Text>
              <Progress
                percent={getProgressPercent()}
                status={getTimeColor() === 'error' ? 'exception' : 'active'}
                strokeColor={getTimeColor() === 'error' ? '#ff4d4f' : '#1890ff'}
              />
            </div>
          </Col>
          <Col span={12}>
            <div>
              <Text strong>Câu đã trả lời:</Text>
              <Progress
                percent={Math.round((getAnsweredCount() / exam.questions.length) * 100)}
                format={() => `${getAnsweredCount()}/${exam.questions.length}`}
              />
            </div>
          </Col>
        </Row>
      </Card>

      {/* Time Warning */}
      {timeLeft && timeLeft < 300 && (
        <Alert
          message="Cảnh báo thời gian!"
          description="Thời gian làm bài sắp hết. Vui lòng kiểm tra và nộp bài."
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Questions */}
      <div style={{ marginBottom: 24 }}>
        {exam.questions.map((question, index) => (
          <Card
            key={question._id}
            style={{ marginBottom: 16 }}
            title={
              <Space>
                <Tag color={answers[question._id] !== undefined ? "green" : "default"}>
                  Câu {index + 1}
                </Tag>
                <span>{question.content}</span>
              </Space>
            }
          >
            <Radio.Group
              value={answers[question._id]}
              onChange={(e) => handleChange(question._id, e.target.value)}
              style={{ width: '100%' }}
              disabled={score !== null}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                {question.options.map((option, optionIndex) => (
                  <Radio
                    key={optionIndex}
                    value={optionIndex}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #f0f0f0',
                      borderRadius: '6px',
                      margin: '4px 0',
                      display: 'block'
                    }}
                  >
                    <Text>{option}</Text>
                  </Radio>
                ))}
              </Space>
            </Radio.Group>
          </Card>
        ))}
      </div>

      {/* Submit Button */}
      <Card>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Text strong>Tổng cộng: {exam.questions.length} câu hỏi</Text>
              <Divider type="vertical" />
              <Text type={getAnsweredCount() === exam.questions.length ? "success" : "warning"}>
                <CheckCircleOutlined /> Đã trả lời: {getAnsweredCount()}/{exam.questions.length}
              </Text>
            </Space>
          </Col>
          <Col>
            <Button
              type="primary"
              size="large"
              icon={<SendOutlined />}
              onClick={showSubmitConfirm}
              disabled={score !== null}
              loading={submitting}
              style={{ minWidth: 120 }}
            >
              Nộp bài
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default TakeExam;