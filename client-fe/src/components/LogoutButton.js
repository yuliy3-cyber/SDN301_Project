import React from "react";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";

function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login", { replace: true });
  };

  return (
    <Button type="primary" danger onClick={handleLogout}>
      Đăng xuất
    </Button>
  );
}

export default LogoutButton;
