import React from "react";
import { Layout } from "antd";

const { Footer } = Layout;

function AppFooter() {
  return (
   <Footer style={{
  textAlign: "center",
  background: "#f0f2f5",
  padding: "16px 0"
}}>
  © {new Date().getFullYear()} Quiz System. All rights reserved.
</Footer>
  );
}

export default AppFooter;
