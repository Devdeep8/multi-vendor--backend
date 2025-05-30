const DataTypes = require("sequelize");
module.exports = (sequelize) => {
  const OrderItem = sequelize.define('OrderItem', {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    order_id: { type: DataTypes.UUID, allowNull: false },
    product_variant_id: { type: DataTypes.UUID, allowNull: false },
    seller_id: { type: DataTypes.UUID, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  }, {
    timestamps: false,
    tableName: 'order_items',
  });

  return OrderItem;
};
