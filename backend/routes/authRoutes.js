const express = require("express");
const router = express.Router();

const { login, register, logout } = require("../controllers/authController");

// Endpoint auth
router.post("/login", login);
router.post("/register", register);
router.post("/logout", logout);

module.exports = router;