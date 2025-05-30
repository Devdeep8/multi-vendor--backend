const DataTypes = require("sequelize");


module.exports = (sequelize) => {
  const CouponRedemption = sequelize.define('CouponRedemption', {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    coupon_id: { type: DataTypes.UUID, allowNull: false },
    user_id: { type: DataTypes.UUID, allowNull: false },
    order_id: { type: DataTypes.UUID, allowNull: false },
    redeemed_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    discount_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  }, {
    timestamps: false,
    tableName: 'coupon_redemptions',
  });

  return CouponRedemption;
};
