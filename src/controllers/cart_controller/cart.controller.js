const db = require('../../../config/database');
const { Op } = require('sequelize');

// Add item to cart 
exports.addToCart = async (req, res) => {
  try { 
    const { product_variant_id, quantity } = req.body;

    console.log(req.body);
    const user_id = req.user.id; // Assuming user is authenticated and user ID is available in req.user

    // Validate input
    if (!product_variant_id || !quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Product variant ID and quantity are required. Quantity must be at least 1.'
      });
    }

    // Check if product variant exists
    const productVariant = await db.ProductVariant.findByPk(product_variant_id, {
      include: [{ 
        model: db.Product,
        attributes: ['id', 'name', 'price', 'description']
      }]
    });
    console.log(productVariant);

    if (!productVariant) {
      return res.status(404).json({
        success: false,
        message: 'Product variant not found'
      });
    }

    // Check if item already exists in cart
    let cartItem = await db.Cart.findOne({
      where: {
        user_id,
        product_variant_id
      }
    });

    if (cartItem) {
      // Update quantity if item already exists
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      // Create new cart item 
      cartItem = await db.Cart.create({
        user_id,
        product_variant_id,
        quantity
      });
    }
    console.log(cartItem);
    return res.status(200).json({
      success: true,
      message: 'Item added to cart successfully',
      data: cartItem
    });
  } catch (error) {
    console.error('Error adding item to cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add item to cart',
      error: error.message
    });
  }
};

// Get cart items for a user
exports.getCartItems = async (req, res) => {
  try {
    const user_id = req.user.id; // Assuming user is authenticated

    const cartItems = await db.Cart.findAll({
      where: { user_id },
      include: [
        {
          model: db.ProductVariant,
          attributes: ["id", "color", "size", "additional_price", "image_url"],
          include: [
            {
              model: db.Product,
              attributes: ["id", "name", "price", "description"],
            },
          ],
        },
      ],
    });

    // Calculate total price
    let totalPrice = 0;
    const cartWithTotals = cartItems.map((item) => {
      const variant = item.ProductVariant;
      const product = variant.Product;
      
      // Calculate price including any additional price from the variant
      const basePrice = parseFloat(product.price);
      const additionalPrice = parseFloat(variant.additional_price || 0);
      const itemPrice = basePrice + additionalPrice;
      const itemTotal = itemPrice * item.quantity;

      totalPrice += itemTotal;
      
      return {
        ...item.toJSON(),
        itemPrice,
        itemTotal,
        productName: product.name,
        productDescription: product.description,
       
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        items: cartWithTotals,
        totalPrice,
        itemCount: cartWithTotals.length,
      },
    });
  } catch (error) {
    console.error('Error fetching cart items:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch cart items',
      error: error.message
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