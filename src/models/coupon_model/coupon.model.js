const DataTypes = require("sequelize");

module.exports = (sequelize) => {
  const Coupon = sequelize.define(
    "Coupon",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
   code: {
  type: DataTypes.STRING,
  allowNull: false,
  unique: {
    name: 'product_variants_code_unique', 
  },
},

      discount_type: {
        type: DataTypes.ENUM("percentage", "fixed"),
        allowNull: false,
      },
      value: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      min_order_amount: { type: DataTypes.DECIMAL(10, 2) },
      max_discount: { type: DataTypes.DECIMAL(10, 2) },
      start_date: { type: DataTypes.DATE, allowNull: false },
      end_date: { type: DataTypes.DATE, allowNull: false },
      is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      seller_id: { type: DataTypes.UUID, allowNull: true },
    },
    {
      timestamps: false,
      tableName: "coupons",
    }
  );

  return Coupon;
};
