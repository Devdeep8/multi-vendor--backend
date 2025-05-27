const db = require("../../../config/database")
const { Wishlist, Product } = db;

// Create a wishlist entry
exports.addToWishlist = async (req, res) => {
  try {
    const { user_id, product_id } = req.body;

    // Prevent duplicates
    const existing = await Wishlist.findOne({ where: { user_id, product_id } });
    if (existing) {
      return res.status(400).json({ message: 'Product already in wishlist' });
    }

    const wishlistItem = await Wishlist.create({ user_id, product_id });
    res.status(201).json(wishlistItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get wishlist for a user
exports.getUserWishlist = async (req, res) => {
  try {
    const { user_id } = req.params;

    const wishlist = await Wishlist.findAll({
      where: { user_id },
      include: [{ model: Product }],
    });

    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Remove from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const { user_id, product_id } = req.body;

    const deleted = await Wishlist.destroy({
      where: { user_id, product_id },
    });

    if (!deleted) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Removed from wishlist' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
