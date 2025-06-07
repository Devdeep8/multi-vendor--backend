const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/admin_controller/admin.controller');
const { verifyToken, isAdmin, isSeller } = require('../../middleware/auth');

const { uploads } = require("../../middleware/multer")




// Dashboard routes
router.get('/dashboard', adminController.getDashboardData);
router.get('/revenue', adminController.getRevenueData);
router.get('/user-activity', adminController.getUserActivity);
router.get('/activities', adminController.getLatestActivities);
router.get('/sellers', adminController.getTopSellers);
router.get('/all-sellers', adminController.getAllSellers );
router.get('/seller/:id', adminController.getSellerById );

// Users management
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserById);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Products management
router.get('/products', adminController.getProducts);
router.get('/products/:id', adminController.getProductById);
router.post('/products', adminController.createProduct);
router.put('/products/:id', adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);
  
// Orders management
router.get('/orders', adminController.getOrders);
router.get('/orders/:id', adminController.getOrderById);
router.put('/orders/:id/status', adminController.updateOrderStatus);
router.delete('/orders/:id', adminController.deleteOrder);

// Categories management
router.get('/categories', adminController.getCategories);
router.get('/categories/:id', adminController.getCategoryById);
router.post('/categories', adminController.createCategory);
router.put('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

// Settings management
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

// Reports
router.get('/reports/sales', adminController.getSalesReport);
router.get('/reports/users', adminController.getUsersReport);
router.get('/reports/products', adminController.getProductsReport);
router.get('/pending/sellers', adminController.getPendingSeller);
router.put("/seller/status", adminController.updateSellerStatus);
router.get("/pending/sellers/by-user-id", verifyToken , adminController.getTheSellerStatus);

router.put("/profile" ,uploads.single("profileImage"),verifyToken,adminController.updateProfile)
router.put("/password" ,verifyToken,adminController.updatePassword)
module.exports = router;