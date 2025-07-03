import React from "react";
import { Layout, Typography, Button, Menu, Space, Tag } from "antd";
import { useNavigate, useLocation } from "react-router-dom";

const { Header } = Layout;
const { Title } = Typography;

function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login", { replace: true });
  };

  const handleMenuClick = (e) => {
    navigate(e.key);
  };

  const userMenuItems = [
    { key: "/user", label: "Trang chính" },
    {key: "/user/questions", label: "Ôn tập" },
    { key: "/user/quiz", label: "Làm bài thi" },
    { key: "/user/results", label: "Kết quả" },
    { key: "/user/profile", label: "Tài khoản" },
  ];

  const adminMenuItems = [
    { key: "/admin", label: "Trang chính" },
    { key: "/admin/users", label: "Người dùng" },
    { key: "/admin/questions", label: "Câu hỏi" },
    { key: "/admin/tests", label: "Đề thi" },
    { key: "/admin/results", label: "Thống kê" },
  ];

  const menuItems = role === "admin" ? adminMenuItems : userMenuItems;

  return (
    <Header
      style={{
        background: "linear-gradient(to right, #001529, #003a8c)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        paddingInline: "2rem",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        zIndex: 10,
      }}
    >
      {/* Logo hoặc tiêu đề */}
      <Title level={4} style={{ color: "#fff", margin: 0 }}>
        📝 Quiz System
      </Title>

      {/* Menu */}
      <Menu
        theme="dark"
        mode="horizontal"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={handleMenuClick}
        style={{
          flex: 1,
          justifyContent: "center",
          background: "transparent",
          fontWeight: 500,
        }}
      />

      {/* Vai trò + logout */}
      <Space>
        <Tag color={role === "admin" ? "volcano" : "blue"} style={{ fontWeight: 500 }}>
          🎖 {role?.toUpperCase()}
        </Tag>
        <Button type="primary" danger onClick={handleLogout}>
          Đăng xuất
        </Button>
      </Space>
    </Header>
  );
}

export default AppHeader;
