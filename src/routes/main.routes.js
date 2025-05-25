const express = require("express")

const router = express.Router()

const userRoutes = require("./user_route/user.route")

router.use("/auth", userRoutes)

module.exports = router