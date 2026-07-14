# ShopNow — Full-Stack eCommerce Platform

A modern, full-featured eCommerce web application built with **React**, **Node.js**, **Express**, and **MongoDB**.

---

## ✨ Features

### Customer Features
- 🔐 **User Authentication** — JWT-based register/login with persistent sessions
- 🛍️ **Product Catalog** — Browse 12+ products across 4 categories with search & filter
- ⭐ **Product Reviews** — Rate and review products (one review per user)
- 🛒 **Shopping Cart** — Add/remove items, update quantities, persistent via localStorage
- 💳 **Checkout** — 3-step flow: Shipping → Payment → Order Review
- 📦 **Order Management** — View order history with full order details
- 👤 **User Profile** — Update name, email, and password

### Admin Features
- 📊 **Dashboard** — Revenue stats, order counts, user metrics, 6-month sales chart
- 📦 **Product Management** — Create, edit, delete products with image upload
- 🗂️ **Order Management** — View all orders, mark as delivered
- 👥 **User Management** — View all users, toggle admin status, delete users

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS v4, React Router v6 |
| Backend | Node.js, Express 4, JWT Auth, Multer |
| Database | MongoDB 7, Mongoose ODM |
| State | React Context API (Auth + Cart) |
| HTTP Client | Axios with request interceptors |
| UI Components | Lucide React icons, React Hot Toast |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your MongoDB URI and JWT secret
```

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_secret_key_here
```

### 3. Seed Sample Data

```bash
cd backend
npm run seed          # Seeds 12 products + admin user
npm run seed -- -d    # Wipe all data
```

**Default admin credentials:**
- Email: `admin@ecommerce.com`
- Password: `admin123`

### 4. Run the Application

```bash
# Terminal 1 — Backend (port 5000)
cd backend && npm run dev

# Terminal 2 — Frontend (port 3000)
cd frontend && npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
CloudAgentPR/
├── backend/
│   ├── config/         # Database connection
│   ├── data/           # Seeder script
│   ├── middleware/      # Auth, admin, error handlers
│   ├── models/          # Mongoose schemas (User, Product, Order)
│   ├── routes/          # Express route handlers
│   ├── uploads/         # Product image uploads
│   └── server.js        # App entry point
│
└── frontend/
    └── src/
        ├── api/         # Axios instance with auth interceptor
        ├── components/  # Reusable UI (Navbar, Footer, ProductCard, etc.)
        ├── context/     # Auth & Cart context providers
        └── pages/       # Route-level page components
            ├── admin/   # Admin-only pages
            └── ...      # Customer pages
```

---

## 🔑 API Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| GET | `/api/products` | List products (paginated, filterable) | Public |
| GET | `/api/products/:id` | Get single product | Public |
| POST | `/api/products/:id/reviews` | Submit product review | User |
| POST | `/api/orders` | Create new order | User |
| GET | `/api/orders/myorders` | Get my orders | User |
| GET | `/api/admin/stats` | Dashboard stats | Admin |
| GET | `/api/admin/users` | All users | Admin |
| PUT | `/api/orders/:id/deliver` | Mark delivered | Admin |

---

## 🛡️ Security

- Passwords hashed with **bcryptjs** (salt rounds: 10)
- Routes protected with **JWT middleware**
- Admin routes double-protected with `protect + admin` middleware
- Input validated at API boundaries
- CORS configured for frontend origin only
