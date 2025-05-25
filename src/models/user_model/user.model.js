const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
const User = sequelize.define('User', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    unique: 'users_email_unique',
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false, 
  },
  profileImage: { 
    type: DataTypes.STRING,
  },
  phone: {
    type: DataTypes.STRING, // Sequelize doesn't have a specific number type for phone numbers
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  role: {
    type: DataTypes.ENUM('user', 'seller', 'admin', 'admin-employee'),
    defaultValue: 'user',
  },
}, {
  tableName: 'users',
  timestamps: false, // since you have explicit created_at/updated_at
   indexes: [
      {
        name: 'users_email_unique',
        unique: true,
        fields: ['email'],
      },
    ],
  
});
module.exports = User;
}
