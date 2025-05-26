const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const Category = sequelize.define('Category', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
            unique: "categories_name_unique",
      validate: {
        notEmpty: true,
      },
    },
    slug: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: "categories_slug_unique"
        }
  }, {
    tableName: 'categories',
    timestamps: true,
    underscored: true,
  })

 

  return Category
}