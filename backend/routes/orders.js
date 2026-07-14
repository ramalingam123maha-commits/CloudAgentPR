const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

// All order routes require authentication
router.use(auth);

// Pricing helpers
const FREE_SHIPPING_THRESHOLD = 100;
const SHIPPING_COST = 9.99;
const TAX_RATE = 0.08;

const calculatePrices = (itemsPrice) => {
  const shippingPrice = itemsPrice > FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const taxPrice = parseFloat((itemsPrice * TAX_RATE).toFixed(2));
  const totalPrice = parseFloat((itemsPrice + shippingPrice + taxPrice).toFixed(2));
  return { shippingPrice, taxPrice, totalPrice };
};

// @route   POST /api/orders
// @desc    Create a new order from the user's cart
// @access  Private
router.post(
  '/',
  [
    body('shippingAddress.firstName').trim().notEmpty().withMessage('First name is required'),
    body('shippingAddress.lastName').trim().notEmpty().withMessage('Last name is required'),
    body('shippingAddress.address').trim().notEmpty().withMessage('Address is required'),
    body('shippingAddress.city').trim().notEmpty().withMessage('City is required'),
    body('shippingAddress.state').trim().notEmpty().withMessage('State is required'),
    body('shippingAddress.zipCode').trim().notEmpty().withMessage('Zip code is required'),
    body('shippingAddress.country').trim().notEmpty().withMessage('Country is required'),
    body('paymentMethod').optional().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { shippingAddress, paymentMethod = 'card' } = req.body;

    try {
      const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');

      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: 'Cart is empty' });
      }

      // Validate stock for each item
      for (const item of cart.items) {
        const product = item.product;
        if (!product) {
          return res.status(404).json({ message: `A product in your cart no longer exists` });
        }
        if (product.stock < item.quantity) {
          return res.status(400).json({
            message: `Insufficient stock for "${product.name}". Available: ${product.stock}`,
          });
        }
      }

      // Build order items and decrement stock
      const orderItems = [];
      for (const item of cart.items) {
        const product = item.product;
        orderItems.push({
          product: product._id,
          name: product.name,
          image: product.images && product.images.length > 0 ? product.images[0] : '',
          price: product.price,
          quantity: item.quantity,
        });

        // Decrement stock
        await Product.findByIdAndUpdate(product._id, {
          $inc: { stock: -item.quantity },
        });
      }

      // Calculate pricing
      const itemsPrice = parseFloat(
        orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)
      );
      const { shippingPrice, taxPrice, totalPrice } = calculatePrices(itemsPrice);

      const order = new Order({
        user: req.user.id,
        items: orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
      });

      await order.save();

      // Clear cart after successful order
      cart.items = [];
      await cart.save();

      res.status(201).json(order);
    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({ message: 'Server error creating order' });
    }
  }
);

// @route   GET /api/orders
// @desc    Get all orders for the current user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
});

// @route   GET /api/orders/:id
// @desc    Get a single order by ID (must belong to user or be admin)
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      'user',
      'name email'
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only allow the order owner or an admin to view this order
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Order not found' });
    }
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error fetching order' });
  }
});

// @route   PUT /api/orders/:id/pay
// @desc    Mark an order as paid
// @access  Private
router.put('/:id/pay', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }

    if (order.isPaid) {
      return res.status(400).json({ message: 'Order is already paid' });
    }

    order.isPaid = true;
    order.paidAt = new Date();
    order.status = 'processing';
    order.paymentResult = {
      id: req.body.id || `PAY-${Date.now()}`,
      status: req.body.status || 'COMPLETED',
      updateTime: req.body.updateTime || new Date().toISOString(),
      emailAddress: req.body.emailAddress || req.user.email,
    };

    await order.save();
    res.json(order);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Order not found' });
    }
    console.error('Pay order error:', error);
    res.status(500).json({ message: 'Server error updating order payment' });
  }
});

module.exports = router;
