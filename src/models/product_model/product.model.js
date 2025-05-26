const { DataTypes } = require('sequelize');



module.exports = (sequelize) => {
 const Product = sequelize.define("Product", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  seller_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  category_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  subcategory_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: 'products_slug_unique'
    },
    shareable_link: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: 'products_link_unique'
    },
  description: {
    type: DataTypes.TEXT,
  },
  brand: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  base_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  discount_percentage: {
      type: DataTypes.DECIMAL(5, 2), // Allow decimals like 14.50%
      allowNull: true,
      defaultValue: 0,
    },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "active",
  },
}, {
  tableName: "products",
  underscored: true,
  timestamps: true,
});
   

  return Product
}