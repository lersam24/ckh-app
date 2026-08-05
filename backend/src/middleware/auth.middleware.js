const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const tokenFromCookie = req.cookies?.token;
  const token = tokenFromCookie || (authHeader && authHeader.split(" ")[1]);

  if (!token) {
    return res.status(401).json({ error: "Tidak terautentikasi" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, nip, email, nama }
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token tidak valid atau kadaluarsa" });
  }
}

module.exports = { requireAuth };
