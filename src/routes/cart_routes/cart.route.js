const express = require('express');
const router = express.Router();
const cartController = require('../../controllers/cart_controller/cart.controller');

router.post('/user_id', cartController.getCartItems);
router.post('/', cartController.addToCart);
router.put('/:id', cartController.updateCartItem);
router.delete('/:id', cartController.removeFromCart);

module.exports = router;
