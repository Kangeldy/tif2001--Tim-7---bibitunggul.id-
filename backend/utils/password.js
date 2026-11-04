
const bcrypt = require("bcryptjs");

// Mengubah password menjadi hash.
async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

// Memeriksa password dengan hash yang tersimpan.
async function verifyPassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

module.exports = {
  hashPassword,
  verifyPassword,
};
