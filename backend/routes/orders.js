const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
router.post(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const { orderItems, shippingAddress, paymentMethod } = req.body;

    if (!orderItems || orderItems.length === 0) {
      res.status(400);
      throw new Error('No order items');
    }

    // Calculate prices
    const itemsPrice = orderItems.reduce(
      (acc, item) => acc + item.price * item.qty,
      0
    );

    // Tax: 15%
    const taxPrice = parseFloat((itemsPrice * 0.15).toFixed(2));

    // Shipping: free over $100, else $10
    const shippingPrice = itemsPrice > 100 ? 0 : 10;

    const totalPrice = parseFloat(
      (itemsPrice + taxPrice + shippingPrice).toFixed(2)
    );

    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  })
);

// @desc    Get logged-in user's orders
// @route   GET /api/orders/myorders
// @access  Private
router.get(
  '/myorders',
  protect,
  asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(orders);
  })
);

// @desc    Get all orders (admin)
// @route   GET /api/orders
// @access  Private/Admin
router.get(
  '/',
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const orders = await Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  })
);

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
router.get(
  '/:id',
  protect,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate(
      'user',
      'name email'
    );

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    // Only the owner or admin can view the order
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      res.status(401);
      throw new Error('Not authorized to view this order');
    }

    res.json(order);
  })
);

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
router.put(
  '/:id/pay',
  protect,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.email_address,
    };

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  })
);

// @desc    Update order to delivered (admin)
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
router.put(
  '/:id/deliver',
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    order.isDelivered = true;
    order.deliveredAt = Date.now();

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  })
);

module.exports = router;
