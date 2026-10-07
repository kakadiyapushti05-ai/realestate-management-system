const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    
    req.user = {
      id: decoded.id,
      role: decoded.role,
      email: decoded.email
    };

    next();

  } catch (err) {
    console.error("JWT Error:", err);
    return res.status(401).json({ message: "Invalid token" });
  }
};

const allowRoles = (...roles) => {
  return (req, res, next) => {

    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  };
};

module.exports = { verifyToken, allowRoles };