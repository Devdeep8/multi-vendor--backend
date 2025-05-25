const express = require("express")

const router = express.Router()

const userRoutes = require("./user_route/user.route")
const seller = require("../routes/seller_route/seller.route")
const category = require("../routes/category_routes/category.routes")
router.use("/auth", userRoutes)
router.use("/sellers", seller)
router.use("/category", category)


module.exports = router