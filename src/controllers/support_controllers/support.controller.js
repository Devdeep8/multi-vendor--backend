const db = require("../../../config/database");
const { SupportTicketReply, SupportTicket, User } = db;

exports.createReply = async (req, res) => {
  try {
    console.log(req.body);
    const { ticket_id, user_id, message } = req.body;

    if (!ticket_id || !user_id || !message || message.trim() === "") {
      return res.status(400).json({ error: "Missing or invalid fields." });
    }

    // Create the reply
    await SupportTicketReply.create({
      ticket_id,
      user_id,
      message: message.trim(),
    });

    // Update the status of the main ticket when a reply is added
    await SupportTicket.update(
      { status: "in_progress" },  // or your desired status
      { where: { id: ticket_id } }
    );

    // Fetch the updated support ticket with replies
    const ticket = await SupportTicket.findByPk(ticket_id, {
      include: [
        {
          model: User,
          attributes: ["id", "name"],
        },
        {
          model: SupportTicketReply,
          as: "SupportTicketReplies",
          include: [
            {
              model: User,
              attributes: ["id", "name"],
            },
          ],
          order: [["created_at", "ASC"]],
        },
      ],
    });

    res.status(200).json(ticket);
  } catch (err) {
    console.error("Error creating reply:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};
