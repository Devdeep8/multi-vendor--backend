const DataTypes = require("sequelize");

module.exports = (sequelize) => {
  const Order = sequelize.define(
    "Order",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      user_id: { type: DataTypes.UUID, allowNull: false },
      total_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      discount_amount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      coupon_id: { type: DataTypes.UUID, allowNull: true },
      billing_address_id: { type: DataTypes.UUID, allowNull: false },
      shipping_address_id: { type: DataTypes.UUID, allowNull: false },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      order_status: { type: DataTypes.STRING, allowNull: false },
      payment_status: { type: DataTypes.STRING, allowNull: false },
    },
    {
      timestamps: false,
      tableName: "orders",
       indexes: [
      { fields: ['user_id'] },                // Find orders by user
      { fields: ['coupon_id'] },              // Find orders by coupon
      { fields: ['created_at'] },             // Sort/filter by date
      { fields: ['order_status'] },           // Filter by order status
      { fields: ['payment_status'] },         // Filter by payment status
      // Composite index example (optional):
      // { fields: ['user_id', 'order_status'] }
    ]
    }
  );

  return Order;
};
