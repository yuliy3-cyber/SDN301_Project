import React from "react";
import MainLayout from "../layout/mainlayout/MainLayout";
import { Typography, Card, Row, Col, Statistic, Button } from "antd";
import {
  UserOutlined,
  BookOutlined,
  FileTextOutlined,
  BarChartOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

function AdminDashboard() {
  return (
    
      <div style={{ padding: "20px" }}>
        <Title level={2}>🎓 Chào mừng Admin</Title>
        <p>Đây là bảng điều khiển trung tâm quản trị hệ thống.</p>

        {/* Thống kê nhanh */}
        <Row gutter={[16, 16]} style={{ marginTop: "20px" }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Tổng số người dùng"
                value={1423}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Số lớp học"
                value={37}
                prefix={<BookOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Kỳ thi đang hoạt động"
                value={12}
                prefix={<FileTextOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Báo cáo chấm điểm"
                value={98}
                prefix={<BarChartOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* Các hành động nhanh */}
        <Title level={4} style={{ marginTop: "30px" }}>🔧 Hành động nhanh</Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Button type="primary" icon={<PlusCircleOutlined />} block>
              Tạo lớp học
            </Button>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Button type="primary" icon={<PlusCircleOutlined />} block>
              Tạo kỳ thi
            </Button>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Button icon={<UserOutlined />} block>
              Quản lý người dùng
            </Button>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Button icon={<BarChartOutlined />} block>
              Xem báo cáo
            </Button>
          </Col>
        </Row>
      </div>
    
  );
}

export default AdminDashboard;
