const db = require('../../../config/database')
const { Op, fn, col } = require("sequelize");

const {SupportTicket} = db
exports.createSupportTicket = async (req, res) => {
  try {
    const { subject, description, category, priority, user_id } = req.body;

    const ticket = await SupportTicket.create({
      subject,
      description,
      category,
      priority, 
      user_id,
    });

    res.status(201).json(ticket);
  } catch (error) {
    console.error("Create Ticket Error:", error);
    res.status(500).json({ error: "Failed to create support ticket." });
  }
};

exports.getAllSupportTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.findAll();
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tickets." });
  }
};

exports.getSupportTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await SupportTicket.findByPk(id);

    if (!ticket) return res.status(404).json({ error: "Ticket not found." });

    res.status(200).json(ticket);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch the ticket." });
  }
};

exports.updateSupportTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const ticket = await SupportTicket.findByPk(id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found." });

    ticket.status = status;
    await ticket.save();

    res.status(200).json(ticket);
  } catch (error) {
    res.status(500).json({ error: "Failed to update ticket status." });
  }
};

exports.deleteSupportTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await SupportTicket.destroy({ where: { id } });
    if (!deleted) return res.status(404).json({ error: "Ticket not found." });

    res.status(200).json({ message: "Ticket deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete ticket." });
  }
};
exports.getSupportTicketsByUserId = async (req, res) => {
    console.log(req.params);
  try {
    const { user_id } = req.params;

    const tickets = await SupportTicket.findAll({
      where: { user_id },
      order: [["created_at", "DESC"]],
    });

    res.status(200).json(tickets);
  } catch (error) {
    console.error("Get Tickets by User Error:", error);
    res.status(500).json({ error: "Failed to fetch tickets for user." });
  }
};


exports.getSupportTicketStats = async (req, res) => {
  try {
    // 1. Total tickets count
    const totalTickets = await db.SupportTicket.count();

    console.log(totalTickets);
    // 2. Count by status
    const ticketsByStatus = await db.SupportTicket.findAll({
      attributes: ["status", [fn("COUNT", col("status")), "count"]],
      group: ["status"],
    });

    console.log(ticketsByStatus);
    // 3. Count by category
    const ticketsByCategory = await db.SupportTicket.findAll({
      attributes: ["category", [fn("COUNT", col("category")), "count"]],
      group: ["category"],
    });

    // 4. Count by priority
    const ticketsByPriority = await db.SupportTicket.findAll({
      attributes: ["priority", [fn("COUNT", col("priority")), "count"]],
      group: ["priority"],
    });

    console.log(ticketsByPriority)

    res.status(200).json({
   
        totalTickets,
        byStatus: formatGroupCount(ticketsByStatus),
        byCategory: formatGroupCount(ticketsByCategory),
        byPriority: formatGroupCount(ticketsByPriority),
    });
  } catch (error) {
    console.error("Error fetching ticket stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch support ticket statistics",
      error: error.message,
    });
  }
};

// Utility to format the grouped results
function formatGroupCount(groupedData) {
  return groupedData.reduce((acc, item) => {
    acc[item.dataValues[item._options.attributes[0]]] = parseInt(item.dataValues.count);
    return acc;
  }, {});
}