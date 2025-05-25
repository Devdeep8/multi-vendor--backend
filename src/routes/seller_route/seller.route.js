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

// Delete seller by ID
router.delete('/delete-seller/:id', sellerController.deleteSeller)

module.exports = router
