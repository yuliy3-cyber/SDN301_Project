import React, { useState } from "react";
import { Form, Input, Button, Typography, Alert, Card } from "antd";
import { UserOutlined, LockOutlined, MailOutlined, IdcardOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

function Register() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setError("");
    setSuccess("");
    try {
      const res = await axios.post("http://localhost:9999/register", values);
      const { token, role, userId } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("userId", userId);

      setSuccess("Đăng ký thành công! Đang chuyển hướng...");
      setTimeout(() => {
        navigate(role === "admin" ? "/admin" : "/user");
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Đăng ký thất bại");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to right,rgb(18, 145, 204))",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "2rem",
      }}
    >
      <Card
        style={{
          width: 450,
          boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
          borderRadius: 12,
        }}
      >
        <Title level={3} style={{ textAlign: "center", marginBottom: "2rem" }}>
          📝 Đăng ký tài khoản
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

        {success && (
          <Alert
            message="Thành công"
            description={success}
            type="success"
            showIcon
            style={{ marginBottom: "1rem" }}
          />
        )}

        <Form name="register" onFinish={onFinish} layout="vertical">
          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
          >
            <Input prefix={<IdcardOutlined />} placeholder="Nguyễn Văn A" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email" },
              { type: "email", message: "Email không hợp lệ" },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="example@gmail.com" />
          </Form.Item>

          <Form.Item
            name="username"
            label="Tên đăng nhập"
            rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập" }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Đăng ký
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: "center" }}>
          <Button type="link" onClick={() => navigate("/login")}>
            Đã có tài khoản? Đăng nhập
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default Register;
