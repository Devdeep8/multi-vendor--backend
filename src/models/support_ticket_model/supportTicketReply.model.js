const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const SupportTicketReply = sequelize.define(
    "SupportTicketReply",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      ticket_id: {
        type: DataTypes.UUID,
        allowNull: false,
       
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
       
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "support_ticket_replies",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return SupportTicketReply;
}; 