const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// All admin routes require authentication + admin role
router.use(auth, admin);

// ---------------------------------------------------------------------------
// STATS
// ---------------------------------------------------------------------------

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics
// @access  Admin
router.get('/stats', async (req, res) => {
  try {
    const [totalOrders, totalProducts, totalUsers, allOrders] = await Promise.all([
      Order.countDocuments(),
      Product.countDocuments(),
      User.countDocuments(),
      Order.find().sort({ createdAt: -1 }),
    ]);

    const totalRevenue = allOrders
      .filter((o) => o.isPaid)
      .reduce((sum, o) => sum + o.totalPrice, 0);

    const recentOrders = allOrders.slice(0, 5);

    // Top products by order frequency
    const productOrderMap = {};
    allOrders.forEach((order) => {
      order.items.forEach((item) => {
        const pid = item.product.toString();
        if (!productOrderMap[pid]) {
          productOrderMap[pid] = { productId: pid, name: item.name, count: 0, revenue: 0 };
        }
        productOrderMap[pid].count += item.quantity;
        productOrderMap[pid].revenue += item.price * item.quantity;
      });
    });
    const topProducts = Object.values(productOrderMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Orders grouped by status
    const statusCounts = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'].reduce(
      (acc, status) => {
        acc[status] = allOrders.filter((o) => o.status === status).length;
        return acc;
      },
      {}
    );

    res.json({
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      totalOrders,
      totalProducts,
      totalUsers,
      recentOrders,
      topProducts,
      ordersByStatus: statusCounts,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: 'Server error fetching stats' });
  }
});

// ---------------------------------------------------------------------------
// PRODUCTS
// ---------------------------------------------------------------------------

// @route   GET /api/admin/products
// @desc    Get all products with pagination
// @access  Admin
router.get('/products', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Product.countDocuments(),
    ]);

    res.json({ products, page, pages: Math.ceil(total / limit), total });
  } catch (error) {
    console.error('Admin get products error:', error);
    res.status(500).json({ message: 'Server error fetching products' });
  }
});

// @route   POST /api/admin/products
// @desc    Create a new product
// @access  Admin
router.post(
  '/products',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
    body('category').notEmpty().withMessage('Category is required'),
    body('brand').trim().notEmpty().withMessage('Brand is required'),
    body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const product = new Product(req.body);
      await product.save();
      res.status(201).json(product);
    } catch (error) {
      console.error('Admin create product error:', error);
      res.status(500).json({ message: 'Server error creating product' });
    }
  }
);

// @route   PUT /api/admin/products/:id
// @desc    Update a product
// @access  Admin
router.put('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Product not found' });
    }
    console.error('Admin update product error:', error);
    res.status(500).json({ message: 'Server error updating product' });
  }
});

// @route   DELETE /api/admin/products/:id
// @desc    Delete a product
// @access  Admin
router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Product not found' });
    }
    console.error('Admin delete product error:', error);
    res.status(500).json({ message: 'Server error deleting product' });
  }
});

// ---------------------------------------------------------------------------
// ORDERS
// ---------------------------------------------------------------------------

// @route   GET /api/admin/orders
// @desc    Get all orders with pagination and optional status filter
// @access  Admin
router.get('/orders', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'name email'),
      Order.countDocuments(filter),
    ]);

    res.json({ orders, page, pages: Math.ceil(total / limit), total });
  } catch (error) {
    console.error('Admin get orders error:', error);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
});

// @route   PUT /api/admin/orders/:id/status
// @desc    Update the status of an order
// @access  Admin
router.put(
  '/orders/:id/status',
  [
    body('status')
      .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
      .withMessage('Invalid order status'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const order = await Order.findById(req.params.id);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      order.status = req.body.status;

      if (req.body.status === 'delivered') {
        order.isDelivered = true;
        order.deliveredAt = new Date();
      }

      await order.save();
      res.json(order);
    } catch (error) {
      if (error.name === 'CastError') {
        return res.status(404).json({ message: 'Order not found' });
      }
      console.error('Admin update order status error:', error);
      res.status(500).json({ message: 'Server error updating order status' });
    }
  }
);

// ---------------------------------------------------------------------------
// USERS
// ---------------------------------------------------------------------------

// @route   GET /api/admin/users
// @desc    Get all users with pagination
// @access  Admin
router.get('/users', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find().select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(),
    ]);

    res.json({ users, page, pages: Math.ceil(total / limit), total });
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Change a user's role
// @access  Admin
router.put(
  '/users/:id/role',
  [
    body('role')
      .isIn(['user', 'admin'])
      .withMessage('Role must be either "user" or "admin"'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Prevent the acting admin from changing their own role
      if (req.params.id === req.user.id) {
        return res.status(400).json({ message: 'Cannot change your own role' });
      }

      const user = await User.findByIdAndUpdate(
        req.params.id,
        { role: req.body.role },
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      if (error.name === 'CastError') {
        return res.status(404).json({ message: 'User not found' });
      }
      console.error('Admin update user role error:', error);
      res.status(500).json({ message: 'Server error updating user role' });
    }
  }
);

module.exports = router;
