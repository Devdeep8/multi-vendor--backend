const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const CouponRedemption = sequelize.define("CouponRedemption", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    coupon_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
     
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
     
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: false,
      
    },
    redeemed_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    discount_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
  }, {
    tableName: "coupon_redemptions",
    timestamps: false,
    indexes: [
      {
        fields: ["coupon_id"],
      },
      {
        fields: ["user_id"],
      },
      {
        fields: ["order_id"],
      },
    ],
  });

  return CouponRedemption;
};
