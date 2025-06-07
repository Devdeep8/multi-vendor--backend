const express = require('express');
const router = express.Router();
const wishlistController = require('../../controllers/wishlist_controller/wishlist.controller');
const { verifyToken } = require('../../middleware/auth');

// Add product to wishlist
router.post('/', verifyToken ,wishlistController.addToWishlist);

// Get all wishlist items for a user
router.get('/:user_id', wishlistController.getUserWishlist);

// Remove product from wishlist
router.delete('/', wishlistController.removeFromWishlist);

module.exports = router;
