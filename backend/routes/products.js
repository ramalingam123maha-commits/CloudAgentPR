const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

// @desc    Fetch all products (with search, filter, pagination)
// @route   GET /api/products
// @access  Public
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const pageSize = 8;
    const page = Number(req.query.page) || 1;

    // Keyword search filter
    const keyword = req.query.keyword
      ? { name: { $regex: req.query.keyword, $options: 'i' } }
      : {};

    // Category filter
    const category = req.query.category ? { category: req.query.category } : {};

    const filter = { ...keyword, ...category };

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({
      products,
      page,
      pages: Math.ceil(total / pageSize),
      total,
    });
  })
);

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  })
);

// @desc    Create a product (admin)
// @route   POST /api/products
// @access  Private/Admin
router.post(
  '/',
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const product = new Product({
      name: req.body.name || 'Sample Product',
      price: req.body.price || 0,
      user: req.user._id,
      image: req.body.image || '/uploads/sample.jpg',
      brand: req.body.brand || 'Sample Brand',
      category: req.body.category || 'Sample Category',
      countInStock: req.body.countInStock || 0,
      numReviews: 0,
      description: req.body.description || 'Sample Description',
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  })
);

// @desc    Update a product (admin)
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put(
  '/:id',
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = req.body.name !== undefined ? req.body.name : product.name;
      product.price =
        req.body.price !== undefined ? req.body.price : product.price;
      product.description =
        req.body.description !== undefined
          ? req.body.description
          : product.description;
      product.image =
        req.body.image !== undefined ? req.body.image : product.image;
      product.brand =
        req.body.brand !== undefined ? req.body.brand : product.brand;
      product.category =
        req.body.category !== undefined ? req.body.category : product.category;
      product.countInStock =
        req.body.countInStock !== undefined
          ? req.body.countInStock
          : product.countInStock;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  })
);

// @desc    Delete a product (admin)
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete(
  '/:id',
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
      await product.deleteOne();
      res.json({ message: 'Product removed' });
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  })
);

// @desc    Create a product review
// @route   POST /api/products/:id/reviews
// @access  Private
router.post(
  '/:id/reviews',
  protect,
  asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    // Check if user already reviewed this product
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('Product already reviewed');
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;

    // Recalculate average rating
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Review added' });
  })
);

module.exports = router;
