const express = require("express");
const router = express.Router();
const inventoryController = require("../../controllers/inventory_controller/inventory_controller");

router.post("/", inventoryController.createInventory);
router.get("/", inventoryController.getAllInventory);
router.get("/:id", inventoryController.getInventoryById);
router.put("/:id", inventoryController.updateInventory);
router.delete("/:id", inventoryController.deleteInventory);

module.exports = router;
