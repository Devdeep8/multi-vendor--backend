const { DataTypes } = require("sequelize");



module.exports = (sequelize,) => {
  const Address = sequelize.define("Address", {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    user_id: DataTypes.UUID,
    type: DataTypes.STRING,
    full_name: DataTypes.STRING,
    line1: DataTypes.STRING,
    line2: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    country: DataTypes.STRING,
    postal_code: DataTypes.STRING,
    phone_number: DataTypes.STRING,
  });
  return Address;
};
