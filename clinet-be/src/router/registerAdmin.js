const express = require("express");
const { register } = require("../controllers/authController");

const router = express.Router();

// POST /register
router.post("/register", register);

module.exports = router;
