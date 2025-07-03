const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.URL + "/" + process.env.DBNAME, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB via Mongoose");
  } catch (error) {
    console.error("❌ Mongoose connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
