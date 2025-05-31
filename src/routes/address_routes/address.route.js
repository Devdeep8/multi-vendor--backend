const express = require('express');
const router = express.Router();
const addresses = require("../../controllers/address_controller/address.controller")
const {verifyToken} = require("../../middleware/auth")

// Middleware to simulate auth (replace with real auth in production)


// Route to create address
router.post('/', verifyToken, addresses.createAddress);
router.get('/user_id', verifyToken, addresses.getAddresses);
// Add these routes to your address router
router.get('/address/all', addresses.getAllUserAddresses);
router.post('/address', addresses.createAddress);
router.put('/address/:id', addresses.updateAddress);
router.delete('/address/:id', addresses.deleteAddress);
module.exports = router;
