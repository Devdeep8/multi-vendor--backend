const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notification_controller/notification.controller");

// Send email notification
router.post("/email", notificationController.sendEmail);

module.exports = router;