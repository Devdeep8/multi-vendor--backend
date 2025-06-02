const db = require('../../../config/database');
const { Op } = require('sequelize');
const moment = require('moment');

// Get all support tickets with filtering
exports.getSupportTickets = async (req, res) => {
  try {
    const {
      status,
      category,
      priority,
      search,
      startDate,
      endDate,
      page = 1,
      limit = 10
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    // Apply filters
    if (status) where.status = status;
    if (category) where.category = category;
    if (priority) where.priority = priority;
    if (search) {
      where[Op.or] = [
        { subject: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }
    if (startDate && endDate) {
      where.created_at = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const tickets = await db.SupportTicket.findAndCountAll({
      where,
      include: [
        {
          model: db.User,
          attributes: ['id', 'name', 'email', 'profileImage']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.status(200).json({
      tickets: tickets.rows,
      total: tickets.count,
      totalPages: Math.ceil(tickets.count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error fetching support tickets:', error);
    res.status(500).json({ message: 'Error fetching support tickets', error: error.message });
  }
};

// Get ticket by ID
exports.getTicketById = async (req, res) => {
  try {
    const ticketId = req.params.id;
    
    const ticket = await db.SupportTicket.findByPk(ticketId, {
      include: [
        {
          model: db.User,
          attributes: ['id', 'name', 'email', 'profileImage']
        },
        {
          model: db.SupportTicketReply,
          include: [
            {
              model: db.User,
              attributes: ['id', 'name', 'email', 'profileImage', 'role']
            }
          ],
          order: [['created_at', 'ASC']]
        }
      ]
    });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    res.status(200).json(ticket);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ message: 'Error fetching ticket', error: error.message });
  }
};

// Create new ticket
exports.createTicket = async (req, res) => {
  try {
    const { subject, description, category, priority, userId } = req.body;

    const ticket = await db.SupportTicket.create({
      subject,
      description,
      category,
      priority,
      status: 'open',
      user_id: userId
    });

    res.status(201).json(ticket);
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ message: 'Error creating ticket', error: error.message });
  }
};

// Update ticket status
exports.updateTicketStatus = async (req, res) => {
  try {
    const ticketId = req.params.id;
    const { status } = req.body;

    const ticket = await db.SupportTicket.findByPk(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    await ticket.update({ status });
    res.status(200).json(ticket);
  } catch (error) {
    console.error('Error updating ticket status:', error);
    res.status(500).json({ message: 'Error updating ticket status', error: error.message });
  }
};

// Add reply to ticket
exports.addTicketReply = async (req, res) => {
  try {
    const ticketId = req.params.id;
    const { message, userId } = req.body;

    const ticket = await db.SupportTicket.findByPk(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const reply = await db.SupportTicketReply.create({
      message,
      ticket_id: ticketId,
      user_id: userId
    });

    // Update ticket status to 'in_progress' if it was 'open'
    if (ticket.status === 'open') {
      await ticket.update({ status: 'in_progress' });
    }

    res.status(201).json(reply);
  } catch (error) {
    console.error('Error adding ticket reply:', error);
    res.status(500).json({ message: 'Error adding ticket reply', error: error.message });
  }
};

// Get ticket statistics
exports.getTicketStats = async (req, res) => {
  try {
    const totalTickets = await db.SupportTicket.count();
    const openTickets = await db.SupportTicket.count({ where: { status: 'open' } });
    const inProgressTickets = await db.SupportTicket.count({ where: { status: 'in_progress' } });
    const closedTickets = await db.SupportTicket.count({ where: { status: 'closed' } });

    // Get tickets by category
    const ticketsByCategory = await db.SupportTicket.findAll({
      attributes: [
        'category',
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
      ],
      group: ['category']
    });

    // Get tickets by priority
    const ticketsByPriority = await db.SupportTicket.findAll({
      attributes: [
        'priority',
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
      ],
      group: ['priority']
    });

    res.status(200).json({
      totalTickets,
      openTickets,
      inProgressTickets,
      closedTickets,
      ticketsByCategory,
      ticketsByPriority
    });
  } catch (error) {
    console.error('Error fetching ticket statistics:', error);
    res.status(500).json({ message: 'Error fetching ticket statistics', error: error.message });
  }
}; 