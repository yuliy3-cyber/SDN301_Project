import React, { useState } from "react";
import { Form, Input, Button, Typography, Alert, Card, Steps } from "antd";
import {
  MailOutlined,
  LockOutlined,
  NumberOutlined,
} from "@ant-design/icons";
import axios from "../axiosInstance";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;
const { Step } = Steps;

function ForgotPassword() {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const steps = [
    { title: "Gửi OTP" },
    { title: "Xác minh OTP" },
    { title: "Đặt lại mật khẩu" },
  ];

  const handleSendOTP = async () => {
    try {
      const values = await form.validateFields(["email"]);
      setLoading(true);
      setError("");
      const res = await axios.post("/api/forgot-password", {
        email: values.email,
      });
      setSuccess(res.data.message);
      setEmail(values.email);
      setCurrentStep(1);
    } catch (err) {
      setError(err.response?.data?.message || "Không thể gửi OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      const values = await form.validateFields(["otp"]);
      setLoading(true);
      setError("");
      const res = await axios.post("/api/verify-otp", {
        email,
        otp: values.otp,
      });
      setSuccess(res.data.message);
      setCurrentStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "OTP không hợp lệ");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    try {
      const values = await form.validateFields(["password"]);
      setLoading(true);
      setError("");
      const res = await axios.post("/api/reset-password", {
        email,
        password: values.password,
      });
      setSuccess("Đặt lại mật khẩu thành công, chuyển hướng đăng nhập...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi cập nhật mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#e6f7ff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "2rem",
      }}
    >
      <Card
        style={{
          width: 450,
          borderRadius: 12,
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
        }}
      >
        <Title level={3} style={{ textAlign: "center", marginBottom: 24 }}>
          🔐 Khôi phục mật khẩu
        </Title>

        <Steps current={currentStep} size="small" style={{ marginBottom: 24 }}>
          {steps.map((step) => (
            <Step key={step.title} title={step.title} />
          ))}
        </Steps>

        {error && (
          <Alert
            type="error"
            message={error}
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        {success && (
          <Alert
            type="success"
            message={success}
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Form form={form} layout="vertical">
          {currentStep === 0 && (
            <>
              <Form.Item
                name="email"
                label="Email đã đăng ký"
                rules={[
                  { required: true, message: "Vui lòng nhập email" },
                  { type: "email", message: "Email không hợp lệ" },
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="example@gmail.com"
                />
              </Form.Item>
              <Button
                type="primary"
                block
                loading={loading}
                onClick={handleSendOTP}
              >
                Gửi mã OTP
              </Button>
            </>
          )}

          {currentStep === 1 && (
            <>
              <Form.Item
                name="otp"
                label="Mã OTP"
                rules={[
                  { required: true, message: "Vui lòng nhập mã OTP" },
                  {
                    pattern: /^\d{6}$/,
                    message: "Mã OTP phải gồm 6 chữ số",
                  },
                ]}
              >
                <Input
                  prefix={<NumberOutlined />}
                  maxLength={6}
                  placeholder="Nhập mã OTP"
                />
              </Form.Item>
              <Button
                type="primary"
                block
                loading={loading}
                onClick={handleVerifyOTP}
              >
                Xác minh OTP
              </Button>
            </>
          )}

          {currentStep === 2 && (
            <>
              <Form.Item
                name="password"
                label="Mật khẩu mới"
                rules={[
                  { required: true, message: "Vui lòng nhập mật khẩu mới" },
                  { min: 6, message: "Mật khẩu tối thiểu 6 ký tự" },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Nhập mật khẩu mới"
                />
              </Form.Item>
              <Button
                type="primary"
                block
                loading={loading}
                onClick={handleResetPassword}
              >
                Đặt lại mật khẩu
              </Button>
            </>
          )}
        </Form>

        <Button
          type="link"
          block
          onClick={() => navigate("/login")}
          style={{ marginTop: 16 }}
        >
          Quay lại đăng nhập
        </Button>
      </Card>
    </div>
  );
}

export default ForgotPassword;
