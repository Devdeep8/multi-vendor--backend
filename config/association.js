module.exports = (db) => {
  // One-to-One: One User has one Seller
  db.User.hasOne(db.Seller, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  db.Seller.belongsTo(db.User, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
};
