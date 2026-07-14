# Library Management System — Explanation Document

## Overview

The **Library Management System (LMS)** is a full-stack web application that enables users to browse, search, and manage a library's book catalog. It includes role-based authentication, a RESTful API backend, and a modern React frontend.

---

## Architecture

```
CloudAgentPR/
├── backend/              # Node.js + Express REST API
│   ├── src/
│   │   ├── app.js        # Express app factory
│   │   ├── server.js     # HTTP server entry point
│   │   ├── routes/
│   │   │   ├── auth.js   # Login & register endpoints
│   │   │   └── books.js  # Books CRUD endpoints
│   │   ├── middleware/
│   │   │   └── auth.js   # JWT authentication middleware
│   │   └── data/
│   │       ├── users.js  # In-memory user store
│   │       └── books.js  # In-memory books store
│   └── __tests__/
│       ├── auth.test.js  # Auth API tests (Supertest + Jest)
│       └── books.test.js # Books API tests (Supertest + Jest)
│
├── frontend/             # React 18 SPA
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.js              # Root component & routing
│       ├── context/
│       │   └── AuthContext.js  # Global auth state (Context API)
│       ├── pages/
│       │   ├── LoginPage.js    # Login / Register forms
│       │   └── BooksPage.js    # Book catalog with search & filters
│       ├── components/
│       │   ├── Navbar.js       # Top navigation with user info
│       │   ├── BookCard.js     # Individual book display card
│       │   └── AddBookModal.js # Admin-only book creation modal
│       └── __tests__/
│           └── App.test.js     # Frontend tests (RTL + Jest)
│
├── EXPLANATION.md        # This document
└── BREAKING_CHANGES.md   # Breaking changes log
```

---

## Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Backend runtime | Node.js 18+ | Server-side JavaScript |
| Backend framework | Express 4 | HTTP routing & middleware |
| Authentication | JSON Web Tokens (JWT) | Stateless session management |
| Password hashing | bcryptjs | Secure password storage |
| Frontend framework | React 18 | UI component library |
| State management | React Context API | Global authentication state |
| Styling | CSS Modules | Scoped, conflict-free styles |
| Testing (backend) | Jest + Supertest | API integration tests |
| Testing (frontend) | Jest + React Testing Library | UI component tests |

---

## Backend API Reference

### Base URL
`http://localhost:5000/api`

### Authentication Endpoints

#### `POST /api/auth/login`
Authenticates a user and returns a JWT token.

**Request body:**
```json
{
  "email": "alice@library.com",
  "password": "password123"
}
```

**Success response (200):**
```json
{
  "token": "<jwt>",
  "user": {
    "id": 1,
    "name": "Alice Johnson",
    "email": "alice@library.com",
    "role": "admin"
  }
}
```

**Error responses:**
- `400` — missing email or password
- `401` — invalid credentials

---

#### `POST /api/auth/register`
Registers a new user account.

**Request body:**
```json
{
  "name": "New User",
  "email": "new@example.com",
  "password": "securepass"
}
```

**Success response (201):** Same shape as login response.

**Error responses:**
- `400` — missing required fields
- `409` — email already registered

---

### Books Endpoints

> All books endpoints require the `Authorization: Bearer <token>` header.

#### `GET /api/books`
Returns all books, with optional query filters.

**Query parameters:**

| Parameter | Type | Description |
|---|---|---|
| `search` | string | Filter by title or author (case-insensitive) |
| `genre` | string | Filter by exact genre |
| `available` | `true`/`false` | Filter by availability status |

**Success response (200):**
```json
{
  "books": [ ...book objects... ],
  "total": 10
}
```

---

#### `GET /api/books/:id`
Returns a single book by ID.

**Success response (200):** `{ "book": { ...book object... } }`

**Error response:**
- `404` — book not found

---

#### `POST /api/books`
Creates a new book. **Admin role required.**

**Request body:**
```json
{
  "title": "New Book",
  "author": "Author Name",
  "genre": "Fiction",
  "year": 2024,
  "pages": 320,
  "description": "A brief synopsis.",
  "available": true
}
```

**Success response (201):** `{ "book": { ...created book... } }`

**Error responses:**
- `400` — missing title or author
- `403` — user is not an admin

---

## Frontend Pages

### Login Page (`/`)
- Two-tab interface: **Sign In** and **Register**
- Demo account cards for quick credential fill
- JWT token stored in `localStorage` on success
- Redirects to Books page after authentication

### Books Catalog Page (authenticated)
- **Stats bar:** Total books, available count, checked-out count
- **Search:** Real-time search across title and author fields (debounced 300ms)
- **Genre filter:** Dropdown to filter by genre category
- **Availability filter:** Toggle to show all / available / checked-out
- **Book cards:** Each card shows genre badge, availability badge, title, author, description excerpt, publication year, and page count
- **Add Book modal:** Accessible only to admin users; sends `POST /api/books`

---

## Authentication Flow

```
User submits credentials
        │
        ▼
POST /api/auth/login ──► bcrypt.compare(password, hash)
        │
        ├─ Match? → sign JWT → return { token, user }
        │
        └─ No match? → 401 Unauthorized

Client stores token in localStorage
        │
        ▼
All subsequent API requests include:
  Authorization: Bearer <token>
        │
        ▼
authenticate() middleware → jwt.verify(token, secret)
        │
        ├─ Valid? → attach req.user → next()
        └─ Invalid/Expired? → 401 Unauthorized
```

---

## Security Considerations

| Concern | Mitigation |
|---|---|
| Password storage | bcryptjs with cost factor 10 — passwords are never stored in plaintext |
| Token forgery | JWT signed with a secret key; signature is verified on every request |
| Token expiry | Tokens expire in 2 hours, limiting the window for stolen token abuse |
| Privilege escalation | Role (`admin`/`user`) is embedded in the JWT payload and checked server-side |
| Input validation | Required fields are validated at the controller level before processing |
| CORS | Configured with the `cors` package; restrict to known origins in production |

---

## Running the Project Locally

### Backend
```bash
cd backend
npm install
npm start       # Starts on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm start       # Starts on http://localhost:3000
```

### Run All Tests
```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && CI=true npm test
```

---

## Demo Accounts

| Role | Email | Password |
|---|---|---|
| Admin | alice@library.com | password123 |
| User | bob@library.com | reader456 |

> **Admin** users can add new books via the "+ Add Book" button.  
> **User** accounts can browse and search the catalog but cannot add books.

---

## Data Model

### User
```typescript
{
  id:       number   // auto-incremented
  name:     string
  email:    string   // unique
  password: string   // bcrypt hash
  role:     "admin" | "user"
}
```

### Book
```typescript
{
  id:          number   // auto-incremented
  title:       string
  author:      string
  genre:       string
  year:        number
  pages:       number
  description: string
  available:   boolean
}
```

---

*Document version: 1.0.0 — corresponds to the initial Library Management System release.*
