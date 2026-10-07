const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  try {

    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //  ADMIN 
    if (decoded.role === "admin") {
      req.user = {
        id: "admin",
        role: "admin",
        email: decoded.email
      };
      return next();
    }

    //  NORMAL USER
    req.user = decoded;
    next();

  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = { verifyToken };