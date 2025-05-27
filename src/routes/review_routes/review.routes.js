const express = require('express');
const router = express.Router();
const reviewController = require('../../controllers/review_controller/review.controller');

// Submit or update a review
router.post('/', reviewController.submitReview);

// Get reviews for a product
router.get('/:product_id', reviewController.getProductReviews);

// Delete a review by review ID
router.delete('/:id', reviewController.deleteReview);

module.exports = router;
