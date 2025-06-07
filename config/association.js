module.exports = (db) => {
  // ======================
  // 🔗 USER Associations
  // ======================
  db.User.hasMany(db.Address, { foreignKey: "user_id", onDelete: "CASCADE" });
  db.Address.belongsTo(db.User, { foreignKey: "user_id", onDelete: "CASCADE" });

  db.User.hasMany(db.Order, { foreignKey: "user_id", onDelete: "CASCADE" });
  db.Order.belongsTo(db.User, { foreignKey: "user_id", onDelete: "CASCADE" });

  db.User.hasOne(db.Seller, { foreignKey: "user_id", onDelete: "CASCADE", onUpdate: "CASCADE" });
  db.Seller.belongsTo(db.User, { foreignKey: "user_id", onDelete: "CASCADE", onUpdate: "CASCADE" });

  db.User.hasMany(db.Wishlist, { foreignKey: "user_id", onDelete: "CASCADE" });
  db.Wishlist.belongsTo(db.User, { foreignKey: "user_id", onDelete: "CASCADE" });

  db.User.hasMany(db.ProductReview, { foreignKey: "user_id", onDelete: "CASCADE" });
  db.ProductReview.belongsTo(db.User, { foreignKey: "user_id", onDelete: "CASCADE" });

  db.User.hasMany(db.CouponRedemption, { foreignKey: "user_id", onDelete: "CASCADE" });
  db.CouponRedemption.belongsTo(db.User, { foreignKey: "user_id", onDelete: "CASCADE" });

  db.User.hasMany(db.AuditLog, { foreignKey: "user_id", onDelete: "CASCADE" });
  db.AuditLog.belongsTo(db.User, { foreignKey: "user_id", onDelete: "CASCADE" });

  db.User.hasMany(db.SupportTicket, { foreignKey: "user_id", onDelete: "CASCADE" });
  db.SupportTicket.belongsTo(db.User, { foreignKey: "user_id", onDelete: "CASCADE" });

  db.User.hasMany(db.SupportTicketReply, { foreignKey: "user_id", onDelete: "CASCADE" });
  db.SupportTicketReply.belongsTo(db.User, { foreignKey: "user_id", onDelete: "CASCADE" });

  // ======================
  // 🔗 ADDRESS → ORDER
  // ======================
  db.Address.hasMany(db.Order, { foreignKey: "billing_address_id", onDelete: "CASCADE" });
  db.Address.hasMany(db.Order, { foreignKey: "shipping_address_id", onDelete: "CASCADE" });

  db.Order.belongsTo(db.Address, {
    foreignKey: "billing_address_id",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  db.Order.belongsTo(db.Address, {
    foreignKey: "shipping_address_id",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  // ======================
  // 🔗 PRODUCT & VARIANT
  // ======================
  db.Seller.hasMany(db.Product, { foreignKey: "seller_id", onDelete: "CASCADE" });
  db.Product.belongsTo(db.Seller, { foreignKey: "seller_id", onDelete: "CASCADE" });

  db.Category.hasMany(db.Product, { foreignKey: "category_id", onDelete: "CASCADE" });
  db.Product.belongsTo(db.Category, { foreignKey: "category_id", onDelete: "CASCADE" });

  db.Product.belongsTo(db.Subcategory, { foreignKey: "subcategory_id", onDelete: "CASCADE" });
  db.Subcategory.hasMany(db.Product, { foreignKey: "subcategory_id", onDelete: "CASCADE" });

  db.Product.hasMany(db.ProductVariant, { foreignKey: "product_id", onDelete: "CASCADE" });
  db.ProductVariant.belongsTo(db.Product, { foreignKey: "product_id", onDelete: "CASCADE" });

  db.Product.hasMany(db.Wishlist, { foreignKey: "product_id", onDelete: "CASCADE" });
  db.Wishlist.belongsTo(db.Product, { foreignKey: "product_id", onDelete: "CASCADE" });

  db.Product.hasMany(db.ProductReview, { foreignKey: "product_id", onDelete: "CASCADE" });
  db.ProductReview.belongsTo(db.Product, { foreignKey: "product_id", onDelete: "CASCADE" });

  db.ProductVariant.hasOne(db.Inventory, { foreignKey: "product_variant_id", onDelete: "CASCADE" });
  db.Inventory.belongsTo(db.ProductVariant, { foreignKey: "product_variant_id", onDelete: "CASCADE" });

  // ======================
  // 🔗 CATEGORY → SUBCATEGORY
  // ======================
  db.Category.hasMany(db.Subcategory, { foreignKey: "category_id", onDelete: "CASCADE" });
  db.Subcategory.belongsTo(db.Category, { foreignKey: "category_id", as: "category", onDelete: "CASCADE" });

  // ======================
  // 🔗 CART
  // ======================
  db.Cart.belongsTo(db.User, { foreignKey: "user_id", onDelete: "CASCADE" });
  db.Cart.belongsTo(db.ProductVariant, { foreignKey: "product_variant_id", onDelete: "CASCADE" });

  // ======================
  // 🔗 ORDERS
  // ======================
  db.Order.belongsTo(db.Coupon, { foreignKey: "coupon_id", onDelete: "SET NULL" });
  db.Coupon.hasMany(db.Order, { foreignKey: "coupon_id", onDelete: "SET NULL" });

  // ======================
  // 🔗 ORDER ITEMS
  // ======================
  db.Order.hasMany(db.OrderItem, { foreignKey: "order_id", onDelete: "CASCADE" });
  db.OrderItem.belongsTo(db.Order, { foreignKey: "order_id", onDelete: "CASCADE" });

  db.OrderItem.belongsTo(db.ProductVariant, { foreignKey: "product_variant_id", onDelete: "CASCADE" });
  db.ProductVariant.hasMany(db.OrderItem, { foreignKey: "product_variant_id", onDelete: "CASCADE" });

  db.OrderItem.belongsTo(db.Product, { foreignKey: "product_id", onDelete: "CASCADE" });
  db.Product.hasMany(db.OrderItem, { foreignKey: "product_id", onDelete: "CASCADE" });

  db.OrderItem.belongsTo(db.Seller, { foreignKey: "seller_id", onDelete: "CASCADE" });

  // ======================
  // 🔗 PAYMENTS
  // ======================
  db.Order.hasOne(db.Payment, { foreignKey: "order_id", onDelete: "CASCADE" });
  db.Payment.belongsTo(db.Order, { foreignKey: "order_id", onDelete: "CASCADE" });

  // ======================
  // 🔗 COUPONS & REDEMPTIONS
  // ======================
  db.Seller.hasMany(db.Coupon, { foreignKey: "seller_id", onDelete: "CASCADE" });
  db.Coupon.belongsTo(db.Seller, { foreignKey: "seller_id", onDelete: "CASCADE" });

  db.Coupon.hasMany(db.CouponRedemption, { foreignKey: "coupon_id", onDelete: "CASCADE" });
  db.CouponRedemption.belongsTo(db.Coupon, { foreignKey: "coupon_id", onDelete: "CASCADE" });

  db.Order.hasOne(db.CouponRedemption, { foreignKey: "order_id", onDelete: "CASCADE" });
  db.CouponRedemption.belongsTo(db.Order, { foreignKey: "order_id", onDelete: "CASCADE" });

  // ======================
  // 🔗 SUPPORT TICKETS
  // ======================
  db.SupportTicket.hasMany(db.SupportTicketReply, { foreignKey: "ticket_id", onDelete: "CASCADE" });
  db.SupportTicketReply.belongsTo(db.SupportTicket, { foreignKey: "ticket_id", onDelete: "CASCADE" });

  // In your model definitions:
db.Seller.hasMany(db.OrderItem, { foreignKey: 'seller_id' });
db.OrderItem.belongsTo(db.Seller, { foreignKey: 'seller_id' }); 

};
