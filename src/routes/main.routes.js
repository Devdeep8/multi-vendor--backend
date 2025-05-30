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
router.use("/inventories", inventoryRoutes);
router.use("/auth", userRoutes)
router.use("/sellers", seller)
router.use("/category", category)
router.use("/product", product)
router.use("/wishlist", wishlist)
router.use("/review", review)
router.use("/cart", cartRoutes)
router.use("/costumer", costumerRoutes)
module.exports = router