const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const connectDB = require('../config/db');

dotenv.config();

connectDB();

// ─── Sample Products ────────────────────────────────────────────────────────
const sampleProducts = [
  // Electronics
  {
    name: 'iPhone 15 Pro',
    image: '/uploads/sample.jpg',
    brand: 'Apple',
    category: 'Electronics',
    description:
      'The iPhone 15 Pro features a titanium design, A17 Pro chip, and a customizable Action button. Experience pro-level photography with a 48MP main camera system and stunning ProMotion display.',
    price: 999,
    countInStock: 25,
    rating: 0,
    numReviews: 0,
  },
  {
    name: 'Samsung 4K Smart TV 55"',
    image: '/uploads/sample.jpg',
    brand: 'Samsung',
    category: 'Electronics',
    description:
      'Immerse yourself in crystal-clear 4K Ultra HD picture quality. This Samsung Smart TV features HDR10+ support, a powerful processor, and built-in streaming apps including Netflix, Disney+, and more.',
    price: 799,
    countInStock: 15,
    rating: 0,
    numReviews: 0,
  },
  {
    name: 'Sony WH-1000XM5 Headphones',
    image: '/uploads/sample.jpg',
    brand: 'Sony',
    category: 'Electronics',
    description:
      'Industry-leading noise cancelling headphones with Auto NC Optimizer. 30-hour battery life, multipoint connection, and crystal clear hands-free calling with precise voice pickup.',
    price: 299,
    countInStock: 40,
    rating: 0,
    numReviews: 0,
  },

  // Clothing
  {
    name: 'Nike Air Max 270',
    image: '/uploads/sample.jpg',
    brand: 'Nike',
    category: 'Clothing',
    description:
      'The Nike Air Max 270 delivers all-day comfort with Max Air cushioning. Mesh upper for breathability, rubber outsole for durability, and a sleek silhouette for everyday style.',
    price: 120,
    countInStock: 60,
    rating: 0,
    numReviews: 0,
  },
  {
    name: "Levi's 501 Original Jeans",
    image: '/uploads/sample.jpg',
    brand: "Levi's",
    category: 'Clothing',
    description:
      "The original straight-fit jean since 1873. Made from 100% cotton denim with Levi's iconic button fly. A timeless American classic that gets better with every wear.",
    price: 89,
    countInStock: 80,
    rating: 0,
    numReviews: 0,
  },
  {
    name: 'The North Face Thermoball Jacket',
    image: '/uploads/sample.jpg',
    brand: 'The North Face',
    category: 'Clothing',
    description:
      'Lightweight, packable warmth with ThermoBall Eco insulation. This jacket is windproof and water-repellent, offering serious warmth in a slim profile. Perfect for outdoor adventures.',
    price: 199,
    countInStock: 35,
    rating: 0,
    numReviews: 0,
  },

  // Books
  {
    name: 'JavaScript: The Definitive Guide',
    image: '/uploads/sample.jpg',
    brand: "O'Reilly Media",
    category: 'Books',
    description:
      'The most comprehensive JavaScript reference available. Covers ES2020 and beyond, with detailed explanations of the language core, web platform APIs, and Node.js. Essential for any JavaScript developer.',
    price: 49,
    countInStock: 100,
    rating: 0,
    numReviews: 0,
  },
  {
    name: 'Clean Code: A Handbook of Agile Software',
    image: '/uploads/sample.jpg',
    brand: 'Prentice Hall',
    category: 'Books',
    description:
      'Robert C. Martin\'s seminal work on writing clean, maintainable code. Learn to distinguish between good and bad code, and discover principles, patterns, and practices for writing clean code.',
    price: 39,
    countInStock: 75,
    rating: 0,
    numReviews: 0,
  },
  {
    name: 'Design Patterns: Elements of Reusable OO Software',
    image: '/uploads/sample.jpg',
    brand: 'Addison-Wesley',
    category: 'Books',
    description:
      'The classic "Gang of Four" book on software design patterns. Describes 23 classic software design patterns with examples, explanations, and practical guidance on when and how to apply each.',
    price: 44,
    countInStock: 55,
    rating: 0,
    numReviews: 0,
  },

  // Home & Garden
  {
    name: 'Breville Barista Express Coffee Maker',
    image: '/uploads/sample.jpg',
    brand: 'Breville',
    category: 'Home & Garden',
    description:
      'All-in-one espresso machine with integrated conical burr grinder. Features a precise espresso extraction system, steam wand for milk frothing, and 54mm portafilter for café-quality espresso at home.',
    price: 79,
    countInStock: 20,
    rating: 0,
    numReviews: 0,
  },
  {
    name: 'Dyson V15 Detect Cordless Vacuum',
    image: '/uploads/sample.jpg',
    brand: 'Dyson',
    category: 'Home & Garden',
    description:
      'The most powerful Dyson cordless vacuum. Laser Detect technology reveals hidden dust. Acoustic piezo sensor counts and sizes dust particles. Up to 60 minutes of fade-free power.',
    price: 399,
    countInStock: 18,
    rating: 0,
    numReviews: 0,
  },
  {
    name: 'Philips Hue White & Color Starter Kit',
    image: '/uploads/sample.jpg',
    brand: 'Philips',
    category: 'Home & Garden',
    description:
      'Transform your home with 16 million colors and shades of white light. Includes 3 A19 smart bulbs and Hue Bridge. Control with the Hue app, Alexa, Google Assistant, or Apple HomeKit.',
    price: 149,
    countInStock: 30,
    rating: 0,
    numReviews: 0,
  },
];

// ─── Seeder Script ───────────────────────────────────────────────────────────
const importData = async () => {
  try {
    // Delete all existing data
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@ecommerce.com',
      password: 'admin123',
      isAdmin: true,
    });

    // Attach admin user to each product
    const productsWithUser = sampleProducts.map((product) => ({
      ...product,
      user: adminUser._id,
    }));

    await Product.insertMany(productsWithUser);

    console.log('✅ Data imported successfully!');
    console.log(`   Admin email   : admin@ecommerce.com`);
    console.log(`   Admin password: admin123`);
    console.log(`   Products seeded: ${sampleProducts.length}`);
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error importing data: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    console.log('✅ All data destroyed!');
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error destroying data: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
