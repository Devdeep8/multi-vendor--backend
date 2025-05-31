const express = require('express');
const router = express.Router();
const cartController = require('../../controllers/cart_controller/cart.controller');
const {verifyToken} = require("../../middleware/auth")


router.get('/user_id', verifyToken,cartController.getCartItems);
router.post('/' ,cartController.addToCart);
router.put('/:id',verifyToken, cartController.updateCartItem);
router.delete('/:id', verifyToken,cartController.removeFromCart);
router.get('/getCartCount', verifyToken, cartController.getTotalCartItems);
module.exports = router;
