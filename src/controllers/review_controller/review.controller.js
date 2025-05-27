const db = require('../../../config/database');
const { ProductReview } = db;

// Create or update a review
exports.submitReview = async (req, res) => {
  try {
    const { user_id, product_id, rating, review_text } = req.body;

    const [review, created] = await ProductReview.upsert({
      user_id,
      product_id,
      rating,
      review_text,
    }, {
      returning: true,
    });

    res.status(created ? 201 : 200).json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get reviews for a product
exports.getProductReviews = async (req, res) => {
  try {
    const { product_id } = req.params;

    const reviews = await ProductReview.findAll({
      where: { product_id },
      include: ['User'],
    });

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a review (by user or admin)
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await ProductReview.destroy({ where: { id } });

    if (!deleted) return res.status(404).json({ message: 'Review not found' });

    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
