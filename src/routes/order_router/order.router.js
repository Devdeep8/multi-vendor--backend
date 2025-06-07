const express = require("express");
const router = express.Router();
const OrderController = require("../../controllers/order_controller/order.controller");

router.post("/", OrderController.create);
router.get("/", OrderController.getAll);
router.get("/:id", OrderController.getById);
router.get("/user/:user_id", OrderController.getByUserId);
router.put('/seller/:id/status', OrderController.updateOrderStatus);

module.exports = router;
