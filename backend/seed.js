require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const connectDB = require('./config/db');
const User = require('./models/User');
const Product = require('./models/Product');

// ─── Seed Users ───────────────────────────────────────────────────────────────

const users = [
  {
    name: 'Admin User',
    email: 'admin@shop.com',
    password: 'admin123',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
  },
  {
    name: 'John Doe',
    email: 'user@shop.com',
    password: 'user123',
    role: 'user',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
  },
];

// ─── Seed Products ────────────────────────────────────────────────────────────

const products = [
  // ── Electronics ──────────────────────────────────────────────────────────
  {
    name: 'Sony WH-1000XM5 Wireless Headphones',
    description:
      'Industry-leading noise canceling with Dual Noise Sensor technology. Up to 30 hours battery life with quick charge (3 min charge = 3 hours playback). Crystal clear hands-free calling and Alexa voice control.',
    price: 349.99,
    category: 'Electronics',
    brand: 'Sony',
    stock: 45,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
    ],
    rating: 4.8,
    numReviews: 234,
    featured: true,
  },
  {
    name: 'Apple MacBook Air 15" M2 Chip',
    description:
      'Supercharged by the next-generation M2 chip, MacBook Air has a stunning 15.3-inch Liquid Retina display, 18-hour battery life, 8-core CPU and 10-core GPU, and up to 24GB of memory.',
    price: 1299.99,
    category: 'Electronics',
    brand: 'Apple',
    stock: 28,
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600',
    ],
    rating: 4.9,
    numReviews: 189,
    featured: true,
  },
  {
    name: 'Samsung 65" QLED 4K Smart TV',
    description:
      'Quantum HDR with 100% Color Volume powered by Quantum Dot technology. Neo Quantum Processor 4K upscales every source to 4K with the power of AI. Built-in Alexa and Google Assistant.',
    price: 1099.99,
    category: 'Electronics',
    brand: 'Samsung',
    stock: 15,
    images: [
      'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600',
    ],
    rating: 4.7,
    numReviews: 312,
    featured: true,
  },
  {
    name: 'Logitech MX Master 3S Wireless Mouse',
    description:
      'Ultra-fast MagSpeed electromagnetic scrolling precise enough to stop on a pixel, quiet enough to use in a library. 8K DPI optical sensor works on glass. Up to 70 days battery life.',
    price: 99.99,
    category: 'Electronics',
    brand: 'Logitech',
    stock: 80,
    images: [
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600',
    ],
    rating: 4.6,
    numReviews: 456,
    featured: false,
  },
  {
    name: 'GoPro HERO12 Black Action Camera',
    description:
      '5.3K60 + 4K120 video recording, 27MP photos. HyperSmooth 6.0 video stabilization. Waterproof to 33ft. 1/1.9" sensor for incredible low-light performance. Easy transfer with the GoPro app.',
    price: 399.99,
    category: 'Electronics',
    brand: 'GoPro',
    stock: 35,
    images: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600',
    ],
    rating: 4.5,
    numReviews: 178,
    featured: false,
  },

  // ── Clothing ──────────────────────────────────────────────────────────────
  {
    name: "Levi's 501 Original Fit Jeans",
    description:
      "The original jean since 1873. The 501 Original Fit is a straight leg jean with a button fly. Made with 100% cotton denim. Available in a variety of washes. A timeless American classic.",
    price: 69.99,
    category: 'Clothing',
    brand: "Levi's",
    stock: 120,
    images: [
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600',
    ],
    rating: 4.4,
    numReviews: 892,
    featured: false,
  },
  {
    name: 'Nike Air Max 270 Running Shoes',
    description:
      "Nike's first lifestyle Air unit with the tallest heel in Nike Air history delivers all-day comfort. The mesh upper is soft and breathable. Max Air cushioning for supreme comfort.",
    price: 149.99,
    category: 'Clothing',
    brand: 'Nike',
    stock: 64,
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
    ],
    rating: 4.6,
    numReviews: 543,
    featured: true,
  },
  {
    name: 'Patagonia Better Sweater Fleece Jacket',
    description:
      "Our classic fleece jacket is made with 100% recycled polyester fleece. Anti-pill finish keeps the fabric looking good over time. Full-zip with zip chest pocket and zippered hand pockets.",
    price: 139.00,
    category: 'Clothing',
    brand: 'Patagonia',
    stock: 42,
    images: [
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600',
    ],
    rating: 4.7,
    numReviews: 267,
    featured: false,
  },

  // ── Books ─────────────────────────────────────────────────────────────────
  {
    name: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    description:
      'Robert C. Martin\'s "Clean Code" is a landmark book in software development. Packed with real-world examples, it teaches you how to write better code that is readable, maintainable, and efficient.',
    price: 44.99,
    category: 'Books',
    brand: 'Prentice Hall',
    stock: 200,
    images: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600',
    ],
    rating: 4.8,
    numReviews: 1245,
    featured: false,
  },
  {
    name: 'Atomic Habits: Tiny Changes, Remarkable Results',
    description:
      "James Clear's #1 New York Times bestseller. No matter your goals, Atomic Habits offers a proven framework for improving every day. Learn how to make good habits inevitable and bad habits impossible.",
    price: 27.99,
    category: 'Books',
    brand: 'Avery Publishing',
    stock: 350,
    images: [
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600',
    ],
    rating: 4.9,
    numReviews: 3421,
    featured: true,
  },

  // ── Home & Garden ─────────────────────────────────────────────────────────
  {
    name: 'Dyson V15 Detect Cordless Vacuum',
    description:
      'Laser detects microscopic dust on hard floors. Acoustically senses particle size and quantity and scientifically validates a deep clean. Up to 60 minutes fade-free power.',
    price: 749.99,
    category: 'Home & Garden',
    brand: 'Dyson',
    stock: 22,
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
    ],
    rating: 4.7,
    numReviews: 389,
    featured: true,
  },
  {
    name: 'Instant Pot Duo 7-in-1 Electric Pressure Cooker',
    description:
      '7-in-1 multi-use programmable cooker: pressure cooker, slow cooker, rice cooker, steamer, sauté, yogurt maker, and warmer. 14 one-touch smart programs. Stainless steel inner pot.',
    price: 89.99,
    category: 'Home & Garden',
    brand: 'Instant Pot',
    stock: 95,
    images: [
      'https://images.unsplash.com/photo-1556911073-52527ac43761?w=600',
    ],
    rating: 4.6,
    numReviews: 8712,
    featured: false,
  },
  {
    name: 'Philips Hue Starter Kit — 4 Smart Bulbs & Bridge',
    description:
      'Control your lights with your voice or smartphone. Millions of colours and white light shades. Compatible with Alexa, Google Assistant, and Apple HomeKit. Works with up to 50 lights.',
    price: 199.99,
    category: 'Home & Garden',
    brand: 'Philips',
    stock: 60,
    images: [
      'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=600',
    ],
    rating: 4.5,
    numReviews: 621,
    featured: false,
  },

  // ── Sports ────────────────────────────────────────────────────────────────
  {
    name: 'Yeti Rambler 30 oz Tumbler with MagSlider Lid',
    description:
      'Double-wall vacuum insulation keeps drinks cold or hot for hours. Dishwasher safe. 18/8 stainless steel for pure taste, no flavour transfer. Duracoat colour stays on and won\'t crack.',
    price: 39.99,
    category: 'Sports',
    brand: 'YETI',
    stock: 150,
    images: [
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600',
    ],
    rating: 4.8,
    numReviews: 2341,
    featured: false,
  },
  {
    name: 'Peloton Resistance Bands Set (5-Pack)',
    description:
      'Five resistance levels (extra light to extra heavy) for total body strength training. Made from premium natural latex. Includes door anchor, ankle straps, and carrying bag.',
    price: 49.99,
    category: 'Sports',
    brand: 'Peloton',
    stock: 180,
    images: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600',
    ],
    rating: 4.4,
    numReviews: 789,
    featured: false,
  },
  {
    name: 'Garmin Forerunner 265 GPS Running Watch',
    description:
      'Bright AMOLED display. Advanced running metrics including Training Readiness, Training Status, and HRV Status. Up to 15 days battery life in smartwatch mode. Multi-band GPS for accuracy.',
    price: 449.99,
    category: 'Sports',
    brand: 'Garmin',
    stock: 30,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
    ],
    rating: 4.7,
    numReviews: 412,
    featured: true,
  },

  // ── Beauty ────────────────────────────────────────────────────────────────
  {
    name: 'CeraVe Moisturizing Cream 19 oz',
    description:
      'Developed with dermatologists, CeraVe Moisturizing Cream has a unique formula with three essential ceramides (1, 3, 6-II) that work to restore and maintain the skin\'s natural barrier. Fragrance-free.',
    price: 18.99,
    category: 'Beauty',
    brand: 'CeraVe',
    stock: 500,
    images: [
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600',
    ],
    rating: 4.8,
    numReviews: 15678,
    featured: false,
  },
  {
    name: 'Dyson Airwrap Complete Hair Styler',
    description:
      'Curl, wave, smooth, and dry. The Coanda effect attracts and wraps hair. Engineered for different hair types. Includes firm smoothing brush, soft smoothing brush, and Coanda smoothing dryer.',
    price: 599.99,
    category: 'Beauty',
    brand: 'Dyson',
    stock: 20,
    images: [
      'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600',
    ],
    rating: 4.6,
    numReviews: 934,
    featured: true,
  },

  // ── Toys ──────────────────────────────────────────────────────────────────
  {
    name: 'LEGO Technic Bugatti Chiron 42083',
    description:
      'Authentically detailed 1:8 scale Bugatti Chiron model. Features 8-speed sequential gearbox, W16 engine with moving pistons, aerodynamic rear spoiler, and signature Bugatti design details. 3,599 pieces.',
    price: 349.99,
    category: 'Toys',
    brand: 'LEGO',
    stock: 18,
    images: [
      'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600',
    ],
    rating: 4.9,
    numReviews: 1102,
    featured: true,
  },
  {
    name: 'Nintendo Switch OLED Model — White',
    description:
      'Play at home on the TV or on-the-go. Features a vibrant 7-inch OLED screen, a wide adjustable stand, 64GB of internal storage, and enhanced audio. Includes Nintendo Switch dock, Joy-Con controllers.',
    price: 349.99,
    category: 'Toys',
    brand: 'Nintendo',
    stock: 40,
    images: [
      'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600',
    ],
    rating: 4.8,
    numReviews: 2876,
    featured: true,
  },
];

// ─── Main Seeder ──────────────────────────────────────────────────────────────

const seed = async () => {
  try {
    await connectDB();

    console.log('🗑  Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
    ]);

    console.log('👤 Seeding users...');
    const createdUsers = [];
    for (const userData of users) {
      const user = new User(userData); // pre-save hook hashes the password
      await user.save();
      createdUsers.push(user);
      console.log(`   ✔ Created user: ${user.email} (${user.role})`);
    }

    console.log('📦 Seeding products...');
    const createdProducts = await Product.insertMany(products);
    console.log(`   ✔ Created ${createdProducts.length} products`);

    console.log('\n✅ Seed completed successfully!');
    console.log('─'.repeat(50));
    console.log('Admin   → email: admin@shop.com  | password: admin123');
    console.log('User    → email: user@shop.com   | password: user123');
    console.log('─'.repeat(50));

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seed();
