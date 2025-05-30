const db = require('../../../config/database');

// Add item to cart 
exports.addToCart = async (req, res) => {
  try {
    const { user_id, product_variant_id, size, color, quantity } = req.body;

    console.log("Request Body:", req.body);

    // Input validation
    if (!user_id || !product_variant_id || !size || !color || !quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "All fields (user_id, product_id, size, color, quantity) are required and quantity must be >= 1.",
      });
    }

    // Find matching product variant by size and color
    const productVariant = await db.ProductVariant.findOne({
      where: {
        size,
        color,
      },
    });

    if (!productVariant) {
      return res.status(404).json({
        success: false,
        message: "No product variant found with the given size and color.",
      });
    }

    // Check inventory for the variant
    const inventory = await db.Inventory.findOne({
      where: { product_variant_id: productVariant.id },
    });

    if (!inventory || inventory.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock for the selected variant.",
      });
    }

    // Check if cart item already exists
    let cartItem = await db.Cart.findOne({
      where: {
        user_id,
        product_variant_id: productVariant.id,
      },
    });

    if (cartItem) {
      const newQuantity = cartItem.quantity + quantity;

      // Ensure total does not exceed stock
      if (newQuantity > inventory.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add ${quantity} more. Only ${inventory.stock - cartItem.quantity} left in stock.`,
        });
      }

      cartItem.quantity = newQuantity;
      await cartItem.save();
    } else {
      cartItem = await db.Cart.create({
        user_id,
        product_variant_id: productVariant.id,
        quantity,
        size,
        color,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Item added to cart successfully",
      data: cartItem,
    });

  } catch (error) {
    console.error("Error adding item to cart:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while adding item to cart",
      error: error.message,
    });
  }
};

// Get cart items for a user
exports.getCartItems = async (req, res) => {
  try {
    const user_id = req.user.id;

    const cartItems = await db.Cart.findAll({
      where: { user_id },
      include: [
        {
          model: db.ProductVariant,
          attributes: ["id", "color", "size", "additional_price", "image_url"],
          include: [
            {
              model: db.Product,
              attributes: ["id", "name", "base_price", "description"],
            },
          ],
        },
      ],
    });

    let subtotal = 0;

    const items = cartItems.map((item) => {
      const variant = item.ProductVariant;
      const product = variant.Product;

      const basePrice = parseFloat(product.base_price);
      const additionalPrice = parseFloat(variant.additional_price || 0);
      const itemPrice = basePrice + additionalPrice;
      const itemTotal = itemPrice * item.quantity;

      subtotal += itemTotal;

      return {
        cartItemId: item.id,
        quantity: item.quantity,

        product: {
          id: product.id,
          name: product.name,
          description: product.description,
        },

        variant: {
          id: variant.id,
          color: variant.color,
          size: variant.size,
          image_url: variant.image_url,
          additional_price: additionalPrice,
        },

        pricing: {
          base_price: basePrice,
          item_price: itemPrice,
          total_price: itemTotal,
        },
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        items,
        subtotal,
        itemCount: items.length,
      },
    });
  } catch (error) {
    console.error('Error fetching cart items:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch cart items',
      error: error.message,
    });
  }
};


// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const user_id = req.user.id; // Assuming user is authenticated

    // Validate input
    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity is required and must be at least 1'
      });
    }

    // Find cart item
    const cartItem = await db.Cart.findOne({
      where: {
        id,
        user_id // Ensure the cart item belongs to the user
      },
      include: [
        {
          model: db.ProductVariant,
          include: [{ model: db.Product }]
        }
      ]
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    // Update quantity
    cartItem.quantity = quantity;
    await cartItem.save();

    return res.status(200).json({
      success: true,
      message: 'Cart item updated successfully',
      data: {
        ...cartItem.toJSON(),
        variant: cartItem.ProductVariant,
        product: cartItem.ProductVariant.Product
      }
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update cart item',
      error: error.message
    });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id; // Assuming user is authenticated

    // Find and delete cart item
    const result = await db.Cart.destroy({
      where: {
        id,
        user_id // Ensure the cart item belongs to the user
      }
    });

    if (result === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Item removed from cart successfully'
    });
  } catch (error) {
    console.error('Error removing item from cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart',
      error: error.message
    });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const user_id = req.user.id; // Assuming user is authenticated

    // Delete all cart items for the user
    await db.Cart.destroy({
      where: { user_id }
    });

    return res.status(200).json({
      success: true,
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
      error: error.message
    });
  }
};