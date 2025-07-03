const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Token missing" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid token" });
  }
};

const checkRole = (role) => {
  return (req, res, next) => {
    if (req.user?.role !== role) {
      return res.status(403).json({ message: "Forbidden - Role required: " + role });
    }
    next();
  };
};

module.exports = { verifyToken, checkRole };
