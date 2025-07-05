import React, { useState, useEffect } from "react";
import { Form, Input, Button, Typography, Alert, Card } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
// import axios from "axios";
import { useNavigate } from "react-router-dom";
import axios from '../axiosInstance';

const { Title } = Typography;

function Login() {
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const userId = localStorage.getItem("userId");

    if (token && role) {
      navigate(role === "admin" ? "/admin" : "/user", { replace: true });
    }
  }, [navigate]);

  const onFinish = async (values) => {
    setError("");
    setLoading(true);
    try {
      const res = await axios.post("/login", values);
      const { token, role, userId } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("userId", userId);

      navigate(role === "admin" ? "/admin" : "/user");
    } catch (err) {
      setError(err.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to right, #1890ff, #e6f7ff)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "2rem",
      }}
    >
      <Card
        style={{
          width: 400,
          boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
          borderRadius: 12,
        }}
      >
        <Title level={3} style={{ textAlign: "center", marginBottom: "2rem" }}>
          🔐 Đăng nhập hệ thống
        </Title>

        {error && (
          <Alert
            message="Lỗi"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: "1rem" }}
          />
        )}

        <Form name="login" onFinish={onFinish} layout="vertical">
          <Form.Item
            name="username"
            label="Tên đăng nhập"
            rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập" }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Nhập username" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Đăng nhập
            </Button>

          </Form.Item>
        </Form>

        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <Button type="link" onClick={() => navigate("/register")}>
            Chưa có tài khoản? Đăng ký ngay
          </Button>
          <br />
          <Button type="link" onClick={() => navigate("/forgot-password")}>
            Quên mật khẩu?
          </Button>
        </div>

      </Card>
    </div>
  );
}

export default Login;
