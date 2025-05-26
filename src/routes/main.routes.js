const express = require("express")

const router = express.Router()

const userRoutes = require("./user_route/user.route")
const seller = require("../routes/seller_route/seller.route")
const category = require("../routes/category_routes/category.routes")
const product = require("../routes/product_route/product.route")
router.use("/auth", userRoutes)
router.use("/sellers", seller)
router.use("/category", category)
router.use("/product", product)


module.exports = router