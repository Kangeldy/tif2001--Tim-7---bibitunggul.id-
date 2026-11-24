
const express = require("express");
const router = express.Router();

const verifyAuth = require("../middlewares/verifyAuth");
const verifyAdmin = require("../middlewares/verifyAdmin");
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct } = require("../controllers/productController");

// Public routes
router.get("/", getProducts);
router.get("/:id", getProductById);

// Admin only routes
router.post("/", verifyAuth, verifyAdmin, createProduct);
router.put("/:id", verifyAuth, verifyAdmin, updateProduct);
router.delete("/:id", verifyAuth, verifyAdmin, deleteProduct);

module.exports = router;

