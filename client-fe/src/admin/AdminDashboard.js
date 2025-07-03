import React, { useEffect, useState, useCallback } from "react";
import { 
  Typography, 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Button, 
  message, 
  Spin, 
  Avatar,
  Badge,
  Divider,
  Space,
  Progress,
  Tag
} from "antd";
import {
  UserOutlined,
  FileTextOutlined,
  BarChartOutlined,
  PlusCircleOutlined,
  DashboardOutlined,
  TeamOutlined,
  BookOutlined,
  TrophyOutlined,
  SettingOutlined,
  RiseOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined
} from "@ant-design/icons";
import axios from "axios";

const { Title, Text } = Typography;

function AdminDashboard() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeExams, setActiveExams] = useState(0);
  const [gradingReports, setGradingReports] = useState(0);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const fetchDashboardData = useCallback(async () => {
    if (!token) {
      message.error("Bạn chưa đăng nhập!");
      window.location.href = "/login";
      return;
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    setLoading(true);
    
    try {
      const [usersRes, testsRes, resultsRes] = await Promise.all([
        axios.get("http://localhost:9999/admin/user", { headers }),
        axios.get("http://localhost:9999/admin/tests", { headers }),
        axios.get("http://localhost:9999/admin/result", { headers })
      ]);

      setTotalUsers(usersRes.data.length);
      setActiveExams(testsRes.data.length);
      setGradingReports(resultsRes.data.length);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      if (error.response?.status === 401) {
        message.error("Phiên đăng nhập đã hết hạn!");
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else {
        message.error("Lỗi tải dữ liệu dashboard");
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleRedirect = (path) => {
    window.location.href = path;
  };

  if (loading) {
    return (
      <div style={{ 
        padding: "60px 20px", 
        textAlign: "center", 
        minHeight: "400px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center"
      }}>
        <Spin size="large" />
        <Text style={{ marginTop: "16px", fontSize: "16px" }}>Đang tải dữ liệu dashboard...</Text>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: "24px", 
      background: "#f5f5f5", 
      minHeight: "100vh" 
    }}>
      {/* Header Section */}
      <div style={{ 
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        borderRadius: "12px",
        padding: "32px",
        marginBottom: "24px",
        color: "white"
      }}>
        <Space align="center" size="large">
          <Avatar size={64} icon={<DashboardOutlined />} style={{ background: "#fff", color: "#667eea" }} />
          <div>
            <Title level={2} style={{ color: "white", margin: 0 }}>
              🎓 Chào mừng Admin
            </Title>
            <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: "16px" }}>
              Bảng điều khiển trung tâm quản trị hệ thống
            </Text>
          </div>
        </Space>
      </div>

      {/* Stats Cards */}
      <Row gutter={[24, 24]} style={{ marginBottom: "32px" }}>
        <Col xs={24} sm={12} lg={8}>
          <Card 
            hoverable
             onClick={() => handleRedirect("http://localhost:3000/admin/users")}
            style={{ 
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              border: "none"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <Statistic
                  title={<Text style={{ fontSize: "14px", fontWeight: "500" }}>Tổng số người dùng</Text>}
                  value={totalUsers}
                  valueStyle={{ color: '#52c41a', fontSize: "28px", fontWeight: "bold" }}
                  
                />
                <Badge status="success" text="Đang hoạt động" />
              </div>
              <Avatar size={56} icon={<TeamOutlined />} style={{ background: "#f6ffed", color: "#52c41a" }} />
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card 
            hoverable
                   onClick={() => handleRedirect("http://localhost:3000/admin/questions")}
            style={{ 
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              border: "none"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <Statistic
                  title={<Text style={{ fontSize: "14px", fontWeight: "500" }}>Kỳ thi đang hoạt động</Text>}
                  value={activeExams}
                  valueStyle={{ color: '#1890ff', fontSize: "28px", fontWeight: "bold" }}
                />
                <Badge status="processing" text="Đang diễn ra" />
              </div>
              <Avatar size={56} icon={<BookOutlined />} style={{ background: "#e6f7ff", color: "#1890ff" }} />
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card 
            hoverable
                 onClick={() => handleRedirect("http://localhost:3000/admin/results")}
            style={{ 
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              border: "none"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <Statistic
                  title={<Text style={{ fontSize: "14px", fontWeight: "500" }}>Báo cáo chấm điểm</Text>}
                  value={gradingReports}
                  valueStyle={{ color: '#fa8c16', fontSize: "28px", fontWeight: "bold" }}
                />
                <Badge status="warning" text="Cần xem xét" />
              </div>
              <Avatar size={56} icon={<TrophyOutlined />} style={{ background: "#fff7e6", color: "#fa8c16" }} />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Card 
        style={{ 
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          border: "none",
          marginBottom: "24px"
        }}
      >
        <div style={{ marginBottom: "20px" }}>
          <Title level={4} style={{ margin: 0, display: "flex", alignItems: "center" }}>
            <RiseOutlined style={{ marginRight: "8px", color: "#1890ff" }} />
            Hành động nhanh
          </Title>
          <Text type="secondary">Các tác vụ thường dùng trong hệ thống</Text>
        </div>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Button
              type="primary"
              icon={<PlusCircleOutlined />}
              block
              size="large"
              style={{ 
                height: "60px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                border: "none",
                fontWeight: "500"
              }}
              onClick={() => handleRedirect("http://localhost:3000/admin/questions")}
            >
              <div>
                <div>Tạo kỳ thi</div>
                <Text style={{ fontSize: "12px", color: "rgba(255,255,255,0.8)" }}>
                  Tạo bài kiểm tra mới
                </Text>
              </div>
            </Button>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Button
              icon={<UserOutlined />}
              block
              size="large"
              style={{ 
                height: "60px",
                borderRadius: "8px",
                borderColor: "#d9d9d9",
                fontWeight: "500"
              }}
              onClick={() => handleRedirect("http://localhost:3000/admin/users")}
            >
              <div>
                <div>Quản lý người dùng</div>
                <Text style={{ fontSize: "12px", color: "#8c8c8c" }}>
                  Xem & chỉnh sửa user
                </Text>
              </div>
            </Button>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Button
              icon={<BarChartOutlined />}
              block
              size="large"
              style={{ 
                height: "60px",
                borderRadius: "8px",
                borderColor: "#d9d9d9",
                fontWeight: "500"
              }}
              onClick={() => handleRedirect("http://localhost:3000/admin/results")}
            >
              <div>
                <div>Xem báo cáo</div>
                <Text style={{ fontSize: "12px", color: "#8c8c8c" }}>
                  Thống kê & phân tích
                </Text>
              </div>
            </Button>
          </Col>
        </Row>
      </Card>

      {/* System Status */}
      <Card 

        style={{ 
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          border: "none"
        }}
      >
        <Title level={4} style={{ marginBottom: "20px", display: "flex", alignItems: "center" }}>
          <SettingOutlined style={{ marginRight: "8px", color: "#52c41a" }} />
          Trạng thái hệ thống
        </Title>
        
        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12} md={6}>
            <div style={{ textAlign: "center" }}>
              <Progress 
                type="circle" 
                percent={95} 
                size={80}
                strokeColor="#52c41a"
              />
              <div style={{ marginTop: "8px" }}>
                <Text strong>Server Status</Text>
                <br />
                <Tag color="green">Online</Tag>
              </div>
            </div>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <div style={{ textAlign: "center" }}>
              <Progress 
                type="circle" 
                percent={87} 
                size={80}
                strokeColor="#1890ff"
              />
              <div style={{ marginTop: "8px" }}>
                <Text strong>Database</Text>
                <br />
                <Tag color="blue">Connected</Tag>
              </div>
            </div>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <div style={{ textAlign: "center" }}>
              <CheckCircleOutlined style={{ fontSize: "80px", color: "#52c41a" }} />
              <div style={{ marginTop: "8px" }}>
                <Text strong>API Status</Text>
                <br />
                <Tag color="green">Healthy</Tag>
              </div>
            </div>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <div style={{ textAlign: "center" }}>
              <ClockCircleOutlined style={{ fontSize: "80px", color: "#fa8c16" }} />
              <div style={{ marginTop: "8px" }}>
                <Text strong>Last Update</Text>
                <br />
                <Tag color="orange">5 phút trước</Tag>
              </div>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
}

export default AdminDashboard;