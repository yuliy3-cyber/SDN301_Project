import React from "react";
import { Typography, Button, Row, Col, Divider, Card } from "antd";
import { useNavigate } from "react-router-dom";

const { Title, Paragraph, Text } = Typography;

function LandingPage() {
  const navigate = useNavigate();

  const handleStart = () => navigate("/login");

  return (
    <div
      style={{
        background: "linear-gradient(to bottom, #e6f7ff 0%, #ffffff 40%)",
        minHeight: "100vh",
        padding: "3rem 1rem",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {/* Banner giới thiệu */}
        <section style={{ textAlign: "center", marginBottom: "4rem" }}>
          <Title level={1}>🎓 Chào mừng đến với Quiz Platform</Title>
          <Paragraph style={{ fontSize: "18px" }}>
            Hệ thống thi trắc nghiệm hiện đại – dành cho sinh viên, giáo viên và doanh nghiệp.
            Nhanh chóng, tiện lợi và hoàn toàn miễn phí.
          </Paragraph>
          <Button type="primary" size="large" onClick={handleStart}>
            Bắt đầu ngay
          </Button>
        </section>

        <Divider />

        {/* Tính năng nổi bật */}
        <section style={{ marginBottom: "4rem" }}>
          <Title level={2}>🚀 Tính năng nổi bật</Title>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Card title="Thi trực tuyến" bordered={false}>
                <Text>
                  Tạo và làm bài thi mọi lúc, mọi nơi. Hỗ trợ đồng hồ đếm ngược và tự động chấm điểm.
                </Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card title="Quản lý đề thi" bordered={false}>
                <Text>
                  Admin có thể tạo ngân hàng câu hỏi, đề thi, và theo dõi kết quả nhanh chóng.
                </Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card title="Phân quyền người dùng" bordered={false}>
                <Text>
                  Hệ thống hỗ trợ phân vai rõ ràng: người dùng và admin với quyền hạn riêng biệt.
                </Text>
              </Card>
            </Col>
          </Row>
        </section>

        <Divider />

        {/* Hướng dẫn sử dụng */}
        <section style={{ marginBottom: "4rem" }}>
          <Title level={2}>📚 Cách sử dụng</Title>
          <Row gutter={[32, 32]}>
            <Col xs={24} md={12}>
              <Title level={4}>👩‍🎓 Đối với người dùng</Title>
              <ul>
                <li>Đăng ký / đăng nhập tài khoản</li>
                <li>Chọn bài thi trong danh sách</li>
                <li>Làm bài → Xem kết quả → Ôn tập</li>
              </ul>
            </Col>
            <Col xs={24} md={12}>
              <Title level={4}>👨‍🏫 Đối với admin</Title>
              <ul>
                <li>Đăng nhập với tài khoản admin</li>
                <li>Thêm câu hỏi, tạo đề thi</li>
                <li>Xem kết quả, thống kê điểm số</li>
              </ul>
            </Col>
          </Row>
        </section>

        <Divider />

        {/* Call to Action */}
        <section style={{ textAlign: "center" }}>
          <Title level={2}>🎯 Sẵn sàng để bắt đầu?</Title>
          <Paragraph>Tham gia thi trắc nghiệm ngay hôm nay và nâng cao kỹ năng của bạn!</Paragraph>
          <Button type="primary" size="large" onClick={handleStart}>
            Vào hệ thống
          </Button>
        </section>
      </div>
    </div>
  );
}

export default LandingPage;
