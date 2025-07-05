const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const uploadRoutes = require("../router/upload");
const path = require("path");


dotenv.config();

const connectDB = require("../db/connectDB");

const { login } = require("../page/login");

// Routers khác
const adminRouter = require("../router/routerAdmin");
const resultRouter = require("../router/routerResult");
const examRouter = require("../router/routerAdmin");
const registerRouter = require("../router/registerAdmin");
const forgetPasswordRouter = require("../router/forgetPassword");


const server = express();
server.use(cors({ origin: "http://localhost:3000", credentials: true }));
server.use(express.json());

// ✅ Đăng nhập
server.post("/login", login);
server.use("/", registerRouter);


// ✅ Các router khác
server.use("/", examRouter);
server.use("/", resultRouter);
server.use("/admin", adminRouter);
server.use("/result", resultRouter);
server.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));
server.use("/upload", uploadRoutes);
server.use("/api", forgetPasswordRouter);


// ✅ Swagger
const swaggerSpec = swaggerJsDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Quiz API",
      version: "1.0.0",
      description: "API cho hệ thống thi trắc nghiệm",
    },
    servers: [{ url: "http://localhost:9999" }]
  },
  apis: ["./src/server/server.js", "./src/router/*.js", "./src/page/*.js"]
});
server.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ✅ Khởi động server
const PORT = process.env.PORT || 9999;
const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
      console.log(`📚 Swagger: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error("❌ Lỗi khi khởi động server:", error.message);
    process.exit(1);
  }
};

startServer();
