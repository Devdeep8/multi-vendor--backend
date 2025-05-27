const { DataTypes } = require('sequelize');


module.exports = (sequelize) => {
  const Inventory = sequelize.define("Inventory", {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    product_variant_id: {
    type: DataTypes.UUID,
      allowNull: false, 
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    restock_date: {
      type: DataTypes.DATE,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: "inventories",
    timestamps: false,
  });

  return Inventory;
};
