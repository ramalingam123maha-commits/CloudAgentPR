const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

const Cart = require('../models/Cart');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

// All cart routes require authentication
router.use(auth);

// @route   GET /api/cart
// @desc    Get the current user's cart
// @access  Private
router.get('/', async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate(
      'items.product',
      'name price images stock'
    );

    if (!cart) {
      cart = { user: req.user.id, items: [] };
    }

    res.json(cart);
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Server error fetching cart' });
  }
});

// @route   POST /api/cart
// @desc    Add an item to the cart (update qty if already exists)
// @access  Private
router.post(
  '/',
  [
    body('productId').notEmpty().withMessage('Product ID is required'),
    body('quantity')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Quantity must be at least 1'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { productId, quantity = 1 } = req.body;

    try {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      if (product.stock < quantity) {
        return res.status(400).json({ message: `Only ${product.stock} units available in stock` });
      }

      let cart = await Cart.findOne({ user: req.user.id });

      if (!cart) {
        cart = new Cart({ user: req.user.id, items: [] });
      }

      const existingItemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );

      if (existingItemIndex >= 0) {
        const newQty = cart.items[existingItemIndex].quantity + quantity;
        if (newQty > product.stock) {
          return res.status(400).json({ message: `Only ${product.stock} units available in stock` });
        }
        cart.items[existingItemIndex].quantity = newQty;
      } else {
        cart.items.push({
          product: product._id,
          name: product.name,
          image: product.images && product.images.length > 0 ? product.images[0] : '',
          price: product.price,
          quantity,
        });
      }

      await cart.save();
      await cart.populate('items.product', 'name price images stock');

      res.status(201).json(cart);
    } catch (error) {
      if (error.name === 'CastError') {
        return res.status(404).json({ message: 'Product not found' });
      }
      console.error('Add to cart error:', error);
      res.status(500).json({ message: 'Server error adding item to cart' });
    }
  }
);

// @route   PUT /api/cart/:productId
// @desc    Update item quantity in cart
// @access  Private
router.put(
  '/:productId',
  [
    body('quantity')
      .isInt({ min: 1 })
      .withMessage('Quantity must be at least 1'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { quantity } = req.body;
    const { productId } = req.params;

    try {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      if (product.stock < quantity) {
        return res.status(400).json({ message: `Only ${product.stock} units available in stock` });
      }

      const cart = await Cart.findOne({ user: req.user.id });
      if (!cart) {
        return res.status(404).json({ message: 'Cart not found' });
      }

      const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );

      if (itemIndex < 0) {
        return res.status(404).json({ message: 'Item not found in cart' });
      }

      cart.items[itemIndex].quantity = quantity;
      await cart.save();
      await cart.populate('items.product', 'name price images stock');

      res.json(cart);
    } catch (error) {
      if (error.name === 'CastError') {
        return res.status(404).json({ message: 'Product not found' });
      }
      console.error('Update cart error:', error);
      res.status(500).json({ message: 'Server error updating cart' });
    }
  }
);

// @route   DELETE /api/cart/:productId
// @desc    Remove a specific item from the cart
// @access  Private
router.delete('/:productId', async (req, res) => {
  const { productId } = req.params;

  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const initialLength = cart.items.length;
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    if (cart.items.length === initialLength) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    await cart.save();
    await cart.populate('items.product', 'name price images stock');

    res.json(cart);
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Server error removing item from cart' });
  }
});

// @route   DELETE /api/cart
// @desc    Clear the entire cart
// @access  Private
router.delete('/', async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = [];
    await cart.save();

    res.json({ message: 'Cart cleared', cart });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: 'Server error clearing cart' });
  }
});

module.exports = router;
