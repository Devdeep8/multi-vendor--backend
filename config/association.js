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

    db.Category.hasMany(db.Subcategory, {
    foreignKey: 'category_id',
    as: 'subcategories',
    onDelete: 'CASCADE',
  })

  db.Subcategory.belongsTo(db.Category, {
    foreignKey: 'category_id',
    as: 'category',
  })

};
