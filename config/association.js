module.exports = (db) => {
  // Wishlist Associations
  db.Wishlist.belongsTo(db.User, {
    foreignKey: "user_id",
    onDelete: "CASCADE",
  });
  db.Wishlist.belongsTo(db.Product, {
    foreignKey: "product_id",
    onDelete: "CASCADE",
  });

  // ProductReview Associations
  db.ProductReview.belongsTo(db.User, {
    foreignKey: "user_id",
    onDelete: "CASCADE",
  });
  db.ProductReview.belongsTo(db.Product, {
    foreignKey: "product_id",
    onDelete: "CASCADE",
  });

  // Reverse associations
  db.User.hasMany(db.Wishlist, {
    foreignKey: "user_id",
  });
  db.User.hasMany(db.ProductReview, {
    foreignKey: "user_id",
  });

  db.Product.hasMany(db.Wishlist, {
    foreignKey: "product_id",
  });
  db.Product.hasMany(db.ProductReview, {
    foreignKey: "product_id",
  });

  // User → Seller (One-to-One)
  db.User.hasOne(db.Seller, {
    foreignKey: "user_id",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  db.Seller.belongsTo(db.User, {
    foreignKey: "user_id",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  // Category → Subcategory
  db.Category.hasMany(db.Subcategory, {
    foreignKey: "category_id",
    as: "subcategories",
    onDelete: "CASCADE",
  });
  db.Subcategory.belongsTo(db.Category, {
    foreignKey: "category_id",
    as: "category",
  });

  // Product belongsTo
  db.Product.belongsTo(db.Seller, {
    foreignKey: "seller_id",
    onDelete: "CASCADE",
  });
  db.Product.belongsTo(db.Category, {
    foreignKey: "category_id",
    onDelete: "CASCADE",
  });
  db.Product.belongsTo(db.Subcategory, {
    foreignKey: "subcategory_id",
    onDelete: "CASCADE",
  });

  // Product → ProductVariant
  db.Product.hasMany(db.ProductVariant, {
    foreignKey: "product_id",
    onDelete: "CASCADE",
  });
  db.ProductVariant.belongsTo(db.Product, {
    foreignKey: "product_id",
    onDelete: "CASCADE",
  });

  db.Inventory.belongsTo(db.ProductVariant, {
    foreignKey: "product_variant_id",
    onDelete: "CASCADE",
  });

  db.ProductVariant.hasOne(db.Inventory, {
    foreignKey: "product_variant_id",
  });

  db.Cart.belongsTo(db.User, {
    foreignKey: "user_id",
  });

  db.Cart.belongsTo(db.ProductVariant, {
    foreignKey: "product_variant_id",
  });
};
