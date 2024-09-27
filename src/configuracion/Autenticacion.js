const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    const header = req.header("Authorization") || "";
    const token = header.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Token no proporcionado" });
    }
    try {
      const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      req.username = payload.username;
      next();
    } catch (error) {
      return res.status(403).json({ message: "Token no valido" });
    }
  }

module.exports = verifyToken