const express = require('express');
const router = express.Router();
const wishlistController = require('../../controllers/wishlist_controller/wishlist.controller');

// Add product to wishlist
router.post('/', wishlistController.addToWishlist);

// Get all wishlist items for a user
router.get('/:user_id', wishlistController.getUserWishlist);

// Remove product from wishlist
router.delete('/', wishlistController.removeFromWishlist);

module.exports = router;
