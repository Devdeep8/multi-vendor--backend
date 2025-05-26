const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
const ProductVariant = sequelize.define("ProductVariant", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  product_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  size: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  color: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  additional_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0.0,
  },
  sku: {
  type: DataTypes.STRING,
  unique: {
    name: 'product_variants_sku_unique'
  } 
}, 
  image_url: {
    type: DataTypes.JSON, 
    allowNull: true,
  }, 
}, {
  tableName: "product_variants",
  underscored: true,
  timestamps: true,
});
return ProductVariant;
}