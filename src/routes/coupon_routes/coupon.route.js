const express = require('express');
const router = express.Router();
const CouponController = require('../../controllers/coupon_controller/coupon.controller');
const { verifyToken } = require('../../middleware/auth');
// Middleware for authentication (uncomment and implement as needed)
// const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Create a new coupon (requires authentication to get seller_id from user_id)
router.post('/seller', verifyToken,CouponController.createCoupon);

// Get all coupons with optional filters (admin use)
router.get('/all', verifyToken,CouponController.getAllCoupons);

// Get coupon by ID
router.get('/get-discount-by-discoundId/:id',verifyToken ,CouponController.getCouponById);

// Get coupon by code
router.get('/code/:code',verifyToken ,CouponController.getCouponByCode);

// Get coupons for current authenticated user's seller profile
router.get('/my-coupons', verifyToken,CouponController.getCouponsBySellerId);

// Get coupons by specific seller ID (admin use)
router.get('/seller/:seller_id', verifyToken ,CouponController.getCouponsBySpecificSellerId);

// Validate coupon for order
router.post('/validate', verifyToken ,CouponController.validateCoupon);

// Update coupon (only user's own coupons)
router.put('/:id', verifyToken ,CouponController.updateCoupon);

// Soft delete coupon (only user's own coupons)
router.delete('/:id', verifyToken ,CouponController.deleteCoupon);

// Hard delete coupon (admin only)
router.delete('/hard/:id', verifyToken ,CouponController.hardDeleteCoupon);

module.exports = router;