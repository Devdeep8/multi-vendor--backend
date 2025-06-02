const express = require('express')
const router = express.Router()
const sellerController = require('../../controllers/seller.controller/seller.controller')
const { verifyToken } = require('../../middleware/auth')
// Create a new seller
router.post('/create', verifyToken,sellerController.createSeller)

// Get all sellers
router.get('/get-all-seller', sellerController.getAllSellers)

// Get seller by ID
router.get('/get-seller-by-id//:id', sellerController.getSellerById)

// Update seller by ID
router.put('/update-seller/:id', sellerController.updateSeller)

// ✅ Get seller by user ID
router.get('/get-seller-by-userid/:user_id', sellerController.getSellerByUserId)

// get product by seller id 

router.get("/get-product-by-sellerId/:seller_id" , sellerController.getProductsBySellerId)

//get order by seller id
router.get("/get-order-by-sellerId" , verifyToken,sellerController.getOrdersBySellerId)

//get seller discount

router.get("/get-discount-by-sellerId" , verifyToken, sellerController.getDiscountAnalyticsBySeller)


// get the seller's analytics

router.get("/get-seller-analytics", verifyToken, sellerController.getSellerDashboardData)


// Delete seller by ID
router.delete('/delete-seller/:id', sellerController.deleteSeller)

module.exports = router
