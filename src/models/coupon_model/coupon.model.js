const { DataTypes } = require("sequelize");

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
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: {
          name: "coupons_code_unique",
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      type: {
        type: DataTypes.ENUM("percentage", "fixed"),
        allowNull: false,
        defaultValue: "percentage",
      },
      value: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      min_purchase: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      max_discount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      start_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      end_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      usage_limit: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0, // 0 = unlimited
      },
      usage_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      status: {
        type: DataTypes.ENUM("active", "inactive", "expired"),
        defaultValue: "active",
      },
      is_first_order_only: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_one_time_use: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      applies_to: {
        type: DataTypes.ENUM("all", "products", "categories", "sellers"),
        allowNull: false,
        defaultValue: "all",
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      seller_id: {
        type: DataTypes.UUID, 
        allowNull: true,
       
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      timestamps: false,
      tableName: "coupons",
      indexes: [
        {
          name: "coupons_code_unique",
          unique: true,
          fields: ["code"],
        },
      ],
    }
  );

  return Coupon;
};
