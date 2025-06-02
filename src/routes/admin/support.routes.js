const express = require('express');
const router = express.Router();
const supportController = require('../../controllers/admin_controller/support.controller');
const { isAdmin } = require('../../middleware/auth.middleware');

// Get all support tickets with filtering
router.get('/tickets', isAdmin, supportController.getSupportTickets);

// Get ticket by ID
router.get('/tickets/:id', isAdmin, supportController.getTicketById);

// Create new ticket
router.post('/tickets', isAdmin, supportController.createTicket);

// Update ticket status
router.patch('/tickets/:id/status', isAdmin, supportController.updateTicketStatus);

// Add reply to ticket
router.post('/tickets/:id/replies', isAdmin, supportController.addTicketReply);

// Get ticket statistics
router.get('/tickets/stats', isAdmin, supportController.getTicketStats);

module.exports = router; 