const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Get user's cart
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    
    let cart = await Cart.findOne({ where: { userId } });
    
    if (!cart) {
      // Create empty cart if doesn't exist
      cart = await Cart.create({ userId, items: [] });
    }

    // Fetch product details for each item
    const itemsWithDetails = await Promise.all(
      cart.items.map(async (item) => {
        const product = await Product.findByPk(item.productId);
        return {
          ...item,
          product: product ? {
            id: product.id,
            name: product.name,
            price: product.price,
            salePrice: product.salePrice,
            image: product.image
          } : null
        };
      })
    );

    res.json({
      success: true,
      data: {
        id: cart.id,
        items: itemsWithDetails,
        itemCount: cart.items.length
      }
    });
  } catch (error) {
    console.error('❌ Error getting cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cart',
      error: error.message
    });
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1, size = 'One Size', color = null } = req.body;

    // Validate product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Find or create cart
    let cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }

    // Check if item already in cart
    const existingItem = cart.items.find(
      item => item.productId == productId && item.size === size
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        productId,
        quantity,
        size,
        color,
        addedAt: new Date().toISOString()
      });
    }

    await cart.save();

    res.json({
      success: true,
      message: 'Item added to cart',
      data: {
        id: cart.id,
        itemCount: cart.items.length
      }
    });
  } catch (error) {
    console.error('❌ Error adding to cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add to cart',
      error: error.message
    });
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity, size = 'One Size' } = req.body;

    const cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const item = cart.items.find(
      item => item.productId == productId && item.size === size
    );
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not in cart'
      });
    }

    if (quantity <= 0) {
      // Remove item
      cart.items = cart.items.filter(
        item => !(item.productId == productId && item.size === size)
      );
    } else {
      item.quantity = quantity;
    }

    await cart.save();

    res.json({
      success: true,
      message: 'Cart updated',
      data: {
        itemCount: cart.items.length
      }
    });
  } catch (error) {
    console.error('❌ Error updating cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cart',
      error: error.message
    });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, size = 'One Size' } = req.body;

    const cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items = cart.items.filter(
      item => !(item.productId == productId && item.size === size)
    );

    await cart.save();

    res.json({
      success: true,
      message: 'Item removed from cart',
      data: {
        itemCount: cart.items.length
      }
    });
  } catch (error) {
    console.error('❌ Error removing from cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove from cart',
      error: error.message
    });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items = [];
    await cart.save();

    res.json({
      success: true,
      message: 'Cart cleared'
    });
  } catch (error) {
    console.error('❌ Error clearing cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
      error: error.message
    });
  }
};
