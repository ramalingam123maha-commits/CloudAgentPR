# 📚 Library Management System

A full-stack web application for managing and browsing a library book catalog with user authentication and role-based access control.

## Features

- **User Authentication** — JWT-based login and registration with bcrypt password hashing
- **Book Catalog** — Browse 10 pre-loaded books with real-time search and genre/availability filters
- **Role-Based Access** — Admin users can add new books; regular users have read-only access
- **Responsive UI** — Clean, modern React frontend with CSS Modules
- **REST API** — Express.js backend with protected routes
- **Tests** — 21 backend + 12 frontend automated tests

## Quick Start

### Backend
```bash
cd backend
npm install
npm start     # http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm start     # http://localhost:3000
```

### Run Tests
```bash
cd backend && npm test
cd frontend && CI=true npm test
```

## Demo Accounts

| Role  | Email               | Password    |
|-------|---------------------|-------------|
| Admin | alice@library.com   | password123 |
| User  | bob@library.com     | reader456   |

## Documentation

- [EXPLANATION.md](./EXPLANATION.md) — Full architecture, API reference, and how-to guide
- [BREAKING_CHANGES.md](./BREAKING_CHANGES.md) — Breaking change log and versioning policy

## Tech Stack

- **Backend:** Node.js, Express, JWT, bcryptjs
- **Frontend:** React 18, Context API, CSS Modules
- **Testing:** Jest, Supertest, React Testing Library
