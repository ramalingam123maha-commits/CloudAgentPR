# ShopNow — Full-Stack eCommerce Platform

A modern, full-featured eCommerce application built with **React**, **Node.js**, **Express**, and **MongoDB**.

---

## ✨ Features

### Customer-Facing
- **Product Catalog** — Browse 8 categories with search, filters (price, category, brand), sort, and pagination
- **Product Detail** — Image gallery, rating/reviews, stock status, quantity selector
- **Shopping Cart** — Add/update/remove items, real-time price calculation
- **Checkout** — 3-step wizard (Shipping → Payment → Review), automatic tax & shipping calculation
- **Order Management** — Order history, visual status tracker (Pending → Processing → Shipped → Delivered)
- **User Authentication** — JWT-based register/login, protected routes
- **User Profile** — Update name/avatar, change password

### Admin Dashboard
- **Overview Stats** — Total revenue, orders, products, users; recent orders; CSS bar chart
- **Product Management** — Full CRUD with modal, image URL, category, stock management
- **Order Management** — View all orders, filter by status, inline status updates
- **User Management** — View all users, promote/demote roles

---

## 🗂️ Project Structure

```
CloudAgentPR/
├── backend/               # Node.js / Express API
│   ├── config/db.js       # MongoDB connection
│   ├── middleware/        # auth.js, admin.js
│   ├── models/            # User, Product, Order, Cart
│   ├── routes/            # auth, products, cart, orders, admin
│   ├── server.js          # App entry point
│   └── seed.js            # DB seed with 20 products + 2 users
└── frontend/              # React 18 SPA
    └── src/
        ├── api/           # Axios instance
        ├── context/       # AuthContext, CartContext
        ├── components/    # Navbar, Footer, ProductCard, etc.
        └── pages/         # All page components + admin/
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- MongoDB (local or Atlas)

### Backend

```bash
cd backend
cp .env.example .env      # fill in MONGO_URI and JWT_SECRET
npm install
npm run seed              # optional: seed 20 products + 2 demo users
npm start                 # or: npm run dev (nodemon)
```

Environment variables (`backend/.env`):
```
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_super_secret_key
PORT=5000
```

### Frontend

```bash
cd frontend
npm install
npm start                 # dev server at http://localhost:3000
```

---

## 🔑 Demo Accounts (after seeding)

| Role  | Email             | Password   |
|-------|-------------------|------------|
| Admin | admin@shop.com    | admin123   |
| User  | user@shop.com     | user123    |

---

## 📡 API Endpoints

| Method | Endpoint                   | Auth     | Description              |
|--------|----------------------------|----------|--------------------------|
| POST   | /api/auth/register         | —        | Register new user        |
| POST   | /api/auth/login            | —        | Login, receive JWT       |
| GET    | /api/auth/me               | 🔒 User  | Get current user         |
| GET    | /api/products              | —        | List products (filtered) |
| GET    | /api/products/:id          | —        | Single product           |
| POST   | /api/products/:id/reviews  | 🔒 User  | Add review               |
| GET    | /api/cart                  | 🔒 User  | Get cart                 |
| POST   | /api/cart                  | 🔒 User  | Add to cart              |
| PUT    | /api/cart/:productId       | 🔒 User  | Update cart item qty     |
| DELETE | /api/cart/:productId       | 🔒 User  | Remove cart item         |
| POST   | /api/orders                | 🔒 User  | Create order             |
| GET    | /api/orders                | 🔒 User  | List user orders         |
| GET    | /api/admin/stats           | 🔒 Admin | Dashboard stats          |
| GET    | /api/admin/products        | 🔒 Admin | All products             |
| POST   | /api/admin/products        | 🔒 Admin | Create product           |
| PUT    | /api/admin/products/:id    | 🔒 Admin | Update product           |
| DELETE | /api/admin/products/:id    | 🔒 Admin | Delete product           |
| GET    | /api/admin/orders          | 🔒 Admin | All orders               |
| PUT    | /api/admin/orders/:id/status | 🔒 Admin | Update order status    |
| GET    | /api/admin/users           | 🔒 Admin | All users                |
| PUT    | /api/admin/users/:id/role  | 🔒 Admin | Change user role         |

---

## 🛡️ Security
- Passwords hashed with **bcrypt** (salt rounds: 10)
- **JWT** tokens (7-day expiry) stored in localStorage
- Express-validator input validation on all mutations
- Admin routes double-guarded with `auth` + `admin` middleware
- CORS configured for cross-origin requests

## 💰 Pricing Logic
- **Shipping**: Free for orders ≥ $100, otherwise $9.99
- **Tax**: 8% of items subtotal
- **Total**: items + shipping + tax
