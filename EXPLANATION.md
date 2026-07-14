# Library Management System — Explanation Document

## Overview

The **Library Management System (LMS)** is a full-stack web application that allows users to browse a book catalogue and allows administrators to manage the catalogue. It consists of a **Node.js/Express REST API** (backend) and a **React single-page application** (frontend).

---

## Architecture

```
CloudAgentPR/
├── backend/                 # Express REST API (port 5000)
│   ├── src/
│   │   ├── app.js           # Express app factory (routes, middleware)
│   │   ├── server.js        # HTTP listener entry-point
│   │   ├── routes/
│   │   │   ├── auth.js      # POST /api/auth/login  &  POST /api/auth/register
│   │   │   └── books.js     # CRUD endpoints for /api/books
│   │   ├── middleware/
│   │   │   └── auth.js      # JWT verification middleware (authenticate)
│   │   └── data/
│   │       ├── users.js     # In-memory user store (seeded with 2 demo users)
│   │       └── books.js     # In-memory book store (10 seed books + CRUD helpers)
│   └── __tests__/
│       ├── auth.test.js     # Supertest suite for Auth API (9 tests)
│       └── books.test.js    # Supertest suite for Books API (22 tests)
│
├── frontend/                # React SPA (port 3000)
│   └── src/
│       ├── App.js           # Root component — renders LoginPage or BooksPage
│       ├── context/
│       │   └── AuthContext.js   # React context: user, token, login(), logout()
│       ├── pages/
│       │   ├── LoginPage.js / .module.css   # Sign-in & Register forms
│       │   └── BooksPage.js / .module.css   # Catalogue view with search & filters
│       ├── components/
│       │   ├── Navbar.js / .module.css      # Top navigation bar
│       │   ├── BookCard.js / .module.css    # Single book tile (with admin actions)
│       │   └── AddBookModal.js / .module.css # Admin modal to create a book
│       └── __tests__/
│           └── App.test.js  # React Testing Library suite (25 tests)
│
├── EXPLANATION.md           # This document
├── BREAKING_CHANGES.md      # Breaking change log
└── README.md                # Quick-start guide
```

---

## Backend — Deep Dive

### Technology Stack

| Dependency | Purpose |
|---|---|
| `express` | HTTP framework / router |
| `cors` | Allow cross-origin requests from the React dev server |
| `jsonwebtoken` | Issue and verify JWT access tokens |
| `bcryptjs` | Hash and compare user passwords |
| `jest` + `supertest` | Unit/integration testing |

### Authentication Flow

1. **POST /api/auth/login** — client sends `{email, password}`. The server looks up the user, calls `bcrypt.compare`, and on success returns a signed JWT (2-hour TTL) plus a safe user object (no password hash).
2. **POST /api/auth/register** — client sends `{name, email, password}`. The server hashes the password, pushes the new user into the in-memory store, and returns the same JWT + user shape.
3. **JWT verification** — every protected endpoint passes through the `authenticate` middleware (`middleware/auth.js`), which reads the `Authorization: Bearer <token>` header and calls `jwt.verify`. On success `req.user` is populated with the decoded payload.

### Books API

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/api/books` | ✅ | any | List all books; supports `?search=`, `?genre=`, `?available=true` |
| GET | `/api/books/:id` | ✅ | any | Fetch a single book by ID |
| POST | `/api/books` | ✅ | admin | Create a new book |
| PATCH | `/api/books/:id` | ✅ | admin | Partially update a book (any field) |
| DELETE | `/api/books/:id` | ✅ | admin | Remove a book permanently |

### In-Memory Data Store

Because this demo project has no database, both `users.js` and `books.js` export JavaScript arrays. The `books.js` module exposes:

- `getAll()` — return every book
- `getById(id)` — find by numeric ID
- `getFiltered({search, genre, available})` — filtered list used by `GET /api/books`
- `create(data)` — append and return new book with auto-incremented ID
- `update(id, data)` — merge partial data into existing book, return updated record
- `remove(id)` — splice book from array, return `true`/`false`
- `reset()` — restore seed data (used by the test suite's `beforeEach`)

---

## Frontend — Deep Dive

### Technology Stack

| Dependency | Purpose |
|---|---|
| `react` / `react-dom` | UI rendering |
| `react-scripts` (CRA) | Build toolchain, dev server, test runner |
| `@testing-library/react` | Component-level tests |

### State Management

Global auth state is held in **AuthContext** (`context/AuthContext.js`):

```js
const { user, token, login, logout } = useAuth();
```

`login(user, jwt)` persists both values to `localStorage` so that a page refresh does not log the user out. `logout()` clears them. The context is initialised by reading from `localStorage`, so the app is immediately in the correct state on mount.

### Routing

There is no external router library. `App.js` conditionally renders:

```jsx
return user ? <BooksPage /> : <LoginPage />;
```

This is sufficient for the two-page flow: unauthenticated → login; authenticated → catalogue.

### LoginPage

- **Sign In / Register** tabs switch the `mode` state between `'login'` and `'register'`.
- On submit the page POSTs to `/api/auth/login` or `/api/auth/register`, stores the returned token and user in context, then the app re-renders to `BooksPage`.
- **Demo accounts** buttons fill the form fields automatically for quick testing.
- All errors are shown in an ARIA `role="alert"` banner.

### BooksPage

- Fetches books from `GET /api/books` with a 300 ms debounce when `search`, `genre`, or `showAvailable` change.
- Displays a **stats bar** (total / available / checked-out) computed from the current results.
- **Admins** see a **+ Add Book** button that opens `AddBookModal`.
- Each `<BookCard>` receives `isAdmin`, `token`, `onDelete`, and `onUpdate` props.

### BookCard (Admin Actions)

When the logged-in user has `role === 'admin'`, two extra buttons appear at the bottom of each card:

- **⬆ Check Out / ⬇ Return** — sends `PATCH /api/books/:id` with `{available: !book.available}` and calls `onUpdate(updatedBook)` to update the local list without a full re-fetch.
- **🗑 Delete** — asks for `window.confirm`, then calls `DELETE /api/books/:id` and calls `onDelete(id)` to remove the card from the list.

### AddBookModal

A modal form (only visible to admins) with fields for title, author, genre, year, pages, description, and availability. On submit it posts to `POST /api/books` and calls `onAdd(book)` so the new card is prepended to the grid.

---

## Test Suite

### Backend Tests (`jest` + `supertest`)

| File | Tests | What is covered |
|---|---|---|
| `auth.test.js` | 9 | Login success (admin + user), wrong password, unknown email, missing fields, register success, duplicate email, health endpoint |
| `books.test.js` | 22 | GET list/filters/auth, GET by ID (found + 404), POST (admin + user + validation), PATCH (admin update + user 403 + 404), DELETE (admin + user 403 + 404 + verify-gone) |

Run: `cd backend && npm test`

### Frontend Tests (`@testing-library/react`)

| Describe block | Tests | What is covered |
|---|---|---|
| Login Page | 8 | Form renders, demo accounts, tab switch, credential fill, error alert, successful login redirect, register success, register duplicate-email error |
| Books Page | 8 | Catalog renders, book cards, stats row, Add Book button visibility, non-admin hides Add Book, empty state, fetch error, sign-out |
| BookCard Component | 7 | Renders fields, available/checked-out badge, no admin buttons for regular users, admin buttons for admin, delete confirmation, delete cancel, toggle availability callback |

Run: `cd frontend && npm test`

---

## Running Locally

### Prerequisites

- Node.js ≥ 18

### Backend

```bash
cd backend
npm install
npm start          # starts on http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
npm start          # starts on http://localhost:3000
```

The CRA `proxy` setting (`"proxy": "http://localhost:5000"`) forwards `/api/*` requests to the backend during development.

### Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | alice@library.com | password123 |
| User | bob@library.com | reader456 |

---

## Security Notes

- Passwords are **bcrypt-hashed** (10 rounds) — never stored as plain text.
- JWTs are signed with `HS256` and expire after **2 hours**.
- The `JWT_SECRET` defaults to a hard-coded string but should be set via the `JWT_SECRET` environment variable in production.
- The books data store is **in-memory only** — a server restart resets all changes. A real deployment would use a database (e.g. PostgreSQL with an ORM such as Prisma).
- CORS is currently open (`cors()` with no origin restriction). In production, restrict the allowed origin to the frontend domain.
