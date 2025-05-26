const express = require("express")

const router = express.Router()

const { uploads } = require("../../middleware/multer")
const productController = require("../../controllers/product_controller/product.controller")


router.post("/create" , uploads.any(),productController.createFullProductWithVariants)
module.exports = router  