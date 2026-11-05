
const express = require("express");
const router = express.Router();

const verifyAuth = require("../middlewares/verifyAuth");
const verifyAdmin = require("../middlewares/verifyAdmin");
const {
    getProducts,
} = require("../controllers/productController");

router.get("/", verifyAuth, verifyAdmin, getProducts);

module.exports = router;
