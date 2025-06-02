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
   db.Address.belongsTo(db.User, { foreignKey: "user_id" });
  db.User.hasMany(db.Address, { foreignKey: "user_id" });

  // 🔗 Order associations
  db.Order.belongsTo(db.User, { foreignKey: "user_id" });
  db.Order.belongsTo(db.Coupon, { foreignKey: "coupon_id" });
  db.Order.belongsTo(db.Address, { as: 'billingAddress', foreignKey: "billing_address_id" });
  db.Order.belongsTo(db.Address, { as: 'shippingAddress', foreignKey: "shipping_address_id" });

  db.User.hasMany(db.Order, { foreignKey: "user_id" });
  db.Coupon.hasMany(db.Order, { foreignKey: "coupon_id" });

  // 🔗 OrderItem associations
  db.OrderItem.belongsTo(db.Order, { foreignKey: "order_id" });
  db.Order.hasMany(db.OrderItem, { foreignKey: "order_id" });

  db.OrderItem.belongsTo(db.ProductVariant, { foreignKey: "product_variant_id" });
  db.OrderItem.belongsTo(db.Seller, { foreignKey: "seller_id" });

  // 🔗 Payment associations
  db.Payment.belongsTo(db.Order, { foreignKey: "order_id" });
  db.Order.hasOne(db.Payment, { foreignKey: "order_id" });

  // 🔗 CouponRedemption associations
  db.CouponRedemption.belongsTo(db.Coupon, { foreignKey: "coupon_id" });
  db.CouponRedemption.belongsTo(db.User, { foreignKey: "user_id" });
  db.CouponRedemption.belongsTo(db.Order, { foreignKey: "order_id" });

  db.Coupon.hasMany(db.CouponRedemption, { foreignKey: "coupon_id" });
  db.User.hasMany(db.CouponRedemption, { foreignKey: "user_id" });
  db.Order.hasOne(db.CouponRedemption, { foreignKey: "order_id" });

  // 🔗 Coupon → Seller
  db.Coupon.belongsTo(db.Seller, { foreignKey: "seller_id" }); 
  db.Seller.hasMany(db.Coupon, { foreignKey: "seller_id" });

  // 🔗 AuditLog associations
  db.AuditLog.belongsTo(db.User, { foreignKey: "user_id" });
  db.User.hasMany(db.AuditLog, { foreignKey: "user_id" });

  // Product belongsTo Seller
db.Product.belongsTo(db.Seller, {
  foreignKey: "seller_id",
  onDelete: "CASCADE",
});

// Seller hasMany Products
db.Seller.hasMany(db.Product, {
  foreignKey: "seller_id",
  onDelete: "CASCADE",
});



db.OrderItem.belongsTo(db.ProductVariant, {
  foreignKey: "product_variant_id",
  onDelete: "CASCADE",
});

db.ProductVariant.hasMany(db.OrderItem, {
  foreignKey: "product_variant_id",
  onDelete: "CASCADE",
});

// Product belongsTo Category
db.Product.belongsTo(db.Category, {
  foreignKey: "category_id",
  onDelete: "CASCADE",
});

// Category hasMany Product
db.Category.hasMany(db.Product, {
  foreignKey: "category_id",
  onDelete: "CASCADE",
});

// Support Ticket associations
// db.SupportTicket.belongsTo(db.User, {
//   foreignKey: "user_id",
//   onDelete: "CASCADE",
// });

// db.User.hasMany(db.SupportTicket, {
//   foreignKey: "user_id",
// });

// db.SupportTicketReply.belongsTo(db.SupportTicket, {
//   foreignKey: "ticket_id",
//   onDelete: "CASCADE",
// });

// db.SupportTicket.hasMany(db.SupportTicketReply, {
//   foreignKey: "ticket_id",
// });

// db.SupportTicketReply.belongsTo(db.User, {
//   foreignKey: "user_id",
//   onDelete: "CASCADE",
// });

// db.User.hasMany(db.SupportTicketReply, {
//   foreignKey: "user_id",
// });

};
  