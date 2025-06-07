const express = require('express');
const router = express.Router();
const supportTicketController = require('../../controllers/support_controllers/supportticket.controller');
const SupportTicketReplies = require("../../controllers/support_controllers/support.controller")
router.get("/stats", supportTicketController.getSupportTicketStats);
router.post('/', supportTicketController.createSupportTicket);
router.get('/', supportTicketController.getAllSupportTickets);
router.get('/:id', supportTicketController.getSupportTicketById);
router.patch('/:id/status', supportTicketController.updateSupportTicketStatus);
router.delete('/:id', supportTicketController.deleteSupportTicket);
router.get('/user/:user_id', supportTicketController.getSupportTicketsByUserId);
router.post("/:support_ticket_id/reply", SupportTicketReplies.createReply);


module.exports = router;
