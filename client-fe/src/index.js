import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import "antd/dist/reset.css";
import "./index.css"; // Import file CSS chính của ứng dụng
import { ConfigProvider } from "antd";


const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
 <ConfigProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ConfigProvider>
);
