const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Subcategory = sequelize.define(
    "Subcategory",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      slug: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: "subcategories_slug_unique",
      },
      category_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      tableName: "subcategories",
      timestamps: true,
      underscored: true,
    }
  );

  return Subcategory;
};
