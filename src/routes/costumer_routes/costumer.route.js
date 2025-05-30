// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const newArrivalController = require('../../controllers/costumer_controller/costumer.controller');

router.get('/products/new-arrivals', newArrivalController.getNewArrivals);
router.get('/product/:slug', newArrivalController.getProductBySlug);
module.exports = router;
