
const jwt = require("jsonwebtoken");

function generateToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET belum dikonfigurasi");
  }

  return jwt.sign(
    {
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      subject: user.id,
      expiresIn: "1h",
    }
  );
}

function verifyToken(token) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET belum dikonfigurasi");
  }

  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = {
  generateToken,
  verifyToken,
};
