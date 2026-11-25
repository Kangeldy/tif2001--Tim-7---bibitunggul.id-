const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const verifyAuth = require("../middlewares/verifyAuth");
const verifyAdmin = require("../middlewares/verifyAdmin");

// Endpoint Orders
router.post("/", orderController.createOrder);
router.get("/", orderController.getOrders);
router.get("/:id", orderController.getOrderById);
router.put("/:id", verifyAuth, verifyAdmin, orderController.updateOrder);
router.patch("/:id", verifyAuth, verifyAdmin, orderController.updateOrder);
router.delete("/:id", verifyAuth, verifyAdmin, orderController.deleteOrder);

module.exports = router;
