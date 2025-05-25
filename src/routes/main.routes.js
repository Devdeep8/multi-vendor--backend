const express = require("express")

const router = express.Router()

const userRoutes = require("./user_route/user.route")
const seller = require("../routes/seller_route/seller.route")

router.use("/auth", userRoutes)
router.use("/sellers", seller)

module.exports = router