import React from "react";
import { Navigate, Outlet } from "react-router-dom";

function RequireAuth({ allowedRoles }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // ❌ Nếu chưa đăng nhập → về login
  if (!token || !role) {
    return <Navigate to="/login" replace />;
  }

  // ❌ Nếu role không phù hợp → chặn
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <div style={{ padding: "2rem", color: "red" }}>⛔ Không có quyền truy cập</div>;
  }

  // ✅ Nếu đúng → render child route
  return <Outlet />;
}

export default RequireAuth;
