import React, { useEffect, useState } from "react";
import { Typography, Row, Col, Card, Statistic, Button } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const { Title, Paragraph, Text } = Typography;

function UserDashboard() {
  const navigate = useNavigate();

  const userId = localStorage.getItem("userId"); // bạn cần đảm bảo đã lưu từ lúc login
  const username = localStorage.getItem("username") || "User";
  const fullName = localStorage.getItem("fullName")

  const [stats, setStats] = useState({
    total: 0,
    average: 0,
    latest: "-"
  });

  useEffect(() => {
  const fetchResults = async () => {
    try {
      const res = await axios.get(`http://localhost:9999/results/${userId}`);
      const { total, average, results } = res.data;

      const latestTime =
        results.length > 0
          ? new Date(results[0].submittedAt).toLocaleString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
              day: "2-digit",
              month: "2-digit",
              year: "numeric"
            })
          : "-";

      setStats({
        total,
        average,
        latest: latestTime
      });
    } catch (err) {
      console.error("Không thể tải thống kê người dùng:", err.message);
    }
  };

  if (userId) {
    fetchResults();
  }
}, [userId]);


  return (
   
      <div style={{ padding: "2rem" }}>
        {/* Lời chào */}
        <Title level={3}>👋 Xin chào, {username}</Title>
        <Paragraph>
          Chào mừng bạn đến với hệ thống thi trắc nghiệm. Chúc bạn học tập hiệu quả và đạt kết quả cao!
        </Paragraph>

        {/* Thống kê */}
        <Row gutter={[16, 16]} style={{ marginBottom: "2rem" }}>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <Statistic title="Số bài thi đã làm" value={stats.total} suffix="bài" />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <Statistic title="Điểm trung bình" value={stats.average} suffix="/10" />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <Statistic title="Lần thi gần nhất" value={stats.latest} />
            </Card>
          </Col>
        </Row>

        {/* Gợi ý hành động */}
        <Title level={4}>📌 Bạn muốn làm gì tiếp theo?</Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Card title="🔍 Xem danh sách đề thi" bordered={false}>
              <Text>Khám phá các đề thi đang có, được phân loại theo chủ đề, thời gian, độ khó.</Text>
              <br />
              <Button type="primary" size="small" style={{ marginTop: "0.5rem" }} onClick={() => navigate("/user/quiz")}>
                Vào phần thi
              </Button>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Card title="📄 Kết quả đã làm" bordered={false}>
              <Text>Xem lại toàn bộ lịch sử làm bài của bạn, gồm điểm, thời gian và đáp án đúng/sai.</Text>
              <br />
              <Button size="small" style={{ marginTop: "0.5rem" }} onClick={() => navigate("/user/results")}>
                Xem kết quả
              </Button>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Card title="⚙️ Thông tin tài khoản" bordered={false}>
              <Text>Xem và cập nhật thông tin cá nhân của bạn.</Text>
              <br />
              <Button size="small" style={{ marginTop: "0.5rem" }} onClick={() => navigate("/user/profile")}>
                Vào trang cá nhân
              </Button>
            </Card>
          </Col>
        </Row>
      </div>
   
  );
}

export default UserDashboard;
