const express = require("express")

const router = express.Router()

const userRoutes = require("./user_route/user.route")
const seller = require("../routes/seller_route/seller.route")
const category = require("../routes/category_routes/category.routes")
const product = require("../routes/product_route/product.route")
const wishlist = require("../routes/wishlist_routes/wishlist.routes")
const review = require("../routes/review_routes/review.routes")
const inventoryRoutes = require("../routes/inventory_routes/inventory_routes");
const cartRoutes = require("../routes/cart_routes/cart.route");
const costumerRoutes = require("../routes/costumer_routes/costumer.route")
const addressRoutes = require("../routes/address_routes/address.route")
const couponRoutes = require("../routes/coupon_routes/coupon.route")
const orderRouter = require("../routes/order_router/order.router")
const adminRoutes = require("../routes/admin_routes/admin.routes")
// const supportRoutes = require("./admin/support.routes")



router.use("/inventories", inventoryRoutes);
router.use("/auth", userRoutes)
router.use("/sellers", seller)
router.use("/category", category)
router.use("/product", product)
router.use("/wishlist", wishlist)
router.use("/review", review)
router.use("/cart", cartRoutes)
router.use("/costumer", costumerRoutes)
router.use("/address", addressRoutes)
router.use("/coupon", couponRoutes)
router.use("/order", orderRouter)
router.use("/admin", adminRoutes)
// router.use("/support", supportRoutes)

module.exports = router