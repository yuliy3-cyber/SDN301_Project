import React from "react";
import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import AppHeader from "../header/Header";
import AppFooter from "../footer/Footer";

const { Content } = Layout;

function MainLayout() {
  return (
    <Layout
      style={{
        minHeight: "100vh",
        margin: 0,
        padding: 0,
        backgroundColor: "#f0f2f5",
      }}
    >
      <AppHeader />

      <Content
        style={{
          margin: 0,
          padding: 0,
          width: "100vw", // phủ toàn bộ chiều ngang
          minHeight: "calc(100vh - 64px - 70px)", // header + footer
          backgroundColor: "#f0f2f5",
        }}
      >
        <Outlet />
      </Content>



      <AppFooter />
    </Layout>
  );
}

export default MainLayout;
