import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Form,
  Input,
  Button,
  Alert,
  Card,
  Row,
  Col,
  Space
} from "antd";
import {
  KeyOutlined,
  ArrowRightOutlined,
  AlertOutlined,
  BookOutlined,
  ClockCircleOutlined,
  TeamOutlined
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

const EnterExamCode = () => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setError("");
    if (!code.trim()) {
      setError("Vui lòng nhập mã đề thi!");
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.get(`http://localhost:9999/exam/code/${code}`);
      const examId = res.data.examId;
      navigate(`/user/quiz/${examId}`);
    } catch (err) {
      setError("❌ Mã đề không tồn tại!");
    } finally {
      setIsLoading(false);
    }
  };

 return (
  <div
    style={{
      height: "100vh", // dùng height thay vì minHeight
      overflow: "hidden", // không cho scroll
      background: "linear-gradient(to bottom right, #e0f2fe, #f8fafc)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: 0, // bỏ padding ngoài để tránh tràn
      margin: 0
    }}
  >
    <Card
      style={{
        width: "100%",
        maxWidth: 700,
        maxHeight: "95vh", // ngăn card vượt quá màn hình
        overflowY: "auto", // nếu có nội dung dài thì chỉ cuộn trong card
        boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
        borderRadius: 16
      }}
      bordered={false}
    >
      {/* phần nội dung bên trong giữ nguyên */}

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "linear-gradient(to right, #2563eb, #4f46e5)",
              margin: "0 auto 12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 8px rgba(0,0,0,0.2)"
            }}
          >
            <BookOutlined style={{ fontSize: 28, color: "#fff" }} />
          </div>
          <Title level={3}>Tham gia bài thi</Title>
          <Text type="secondary">Nhập mã đề để bắt đầu làm bài</Text>
        </div>

        {/* Form */}
        <Form layout="vertical" onFinish={handleSubmit}>
          <Form.Item label="Mã đề thi">
            <Input
              size="large"
              placeholder="Nhập exam code (VD: REACT2025)"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              prefix={<KeyOutlined />}
              disabled={isLoading}
            />
          </Form.Item>

          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              icon={<AlertOutlined />}
              style={{ marginBottom: 16 }}
            />
          )}

          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            disabled={!code.trim()}
            loading={isLoading}
            icon={!isLoading && <ArrowRightOutlined />}
          >
            {isLoading ? "Đang kiểm tra..." : "Vào làm bài"}
          </Button>
        </Form>

        {/* Info Grid */}
        <Row gutter={[16, 16]} style={{ marginTop: 32 }}>
          <Col xs={24} md={8}>
            <Card bordered className="shadow-md">
              <Space>
                <ClockCircleOutlined style={{ fontSize: 24, color: "#2563eb" }} />
                <div>
                  <Text strong>Thời gian</Text>
                  <Paragraph type="secondary" style={{ margin: 0, fontSize: 12 }}>
                    Có giới hạn
                  </Paragraph>
                </div>
              </Space>
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card bordered className="shadow-md">
              <Space>
                <BookOutlined style={{ fontSize: 24, color: "#16a34a" }} />
                <div>
                  <Text strong>Câu hỏi</Text>
                  <Paragraph type="secondary" style={{ margin: 0, fontSize: 12 }}>
                    Đa dạng
                  </Paragraph>
                </div>
              </Space>
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card bordered className="shadow-md">
              <Space>
                <TeamOutlined style={{ fontSize: 24, color: "#7e22ce" }} />
                <div>
                  <Text strong>Kết quả</Text>
                  <Paragraph type="secondary" style={{ margin: 0, fontSize: 12 }}>
                    Tức thì
                  </Paragraph>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Footer Note */}
        <div style={{ textAlign: "center", marginTop: 32 }}>
          <Text type="secondary">
            Đảm bảo bạn có kết nối internet ổn định trong suốt quá trình làm bài
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default EnterExamCode;
