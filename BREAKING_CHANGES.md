# Breaking Changes Log

This document records every change that could break existing consumers of the Library Management System API or frontend integration.

---

## [v1.1.0] — Current Release

### New Endpoints (non-breaking additions)

#### `PATCH /api/books/:id` _(NEW)_

Partially updates a book record.

| Detail | Value |
|---|---|
| **Auth required** | Yes — `Authorization: Bearer <token>` |
| **Role required** | `admin` |
| **Body** | Any subset of: `title`, `author`, `genre`, `year`, `pages`, `description`, `available` |
| **Success response** | `200 { book: { ...updatedFields } }` |
| **Error responses** | `401` no/invalid token · `403` non-admin · `404` book not found |

> **Impact:** Additive — no existing call is affected. Clients that previously relied on re-creating a book to update it can now use PATCH.

---

#### `DELETE /api/books/:id` _(NEW)_

Permanently removes a book from the catalogue.

| Detail | Value |
|---|---|
| **Auth required** | Yes — `Authorization: Bearer <token>` |
| **Role required** | `admin` |
| **Success response** | `200 { message: "Book deleted successfully" }` |
| **Error responses** | `401` no/invalid token · `403` non-admin · `404` book not found |

> **Impact:** Additive — no existing call is affected. **Warning:** Deletion is immediate and irreversible in the current in-memory implementation. A production system should add a soft-delete (`deletedAt` timestamp) before deploying this endpoint.

---

### `booksStore` Module API Change _(internal — affects tests only)_

**Previous export:**
```js
module.exports = { getAll, getById, getFiltered, create, reset };
```

**New export:**
```js
module.exports = { getAll, getById, getFiltered, create, update, remove, reset };
```

> **Impact:** Any code that destructures the entire module will now receive two additional functions (`update`, `remove`). This is a non-breaking addition. However, if any downstream code checks the exact set of exported keys (e.g. `Object.keys(booksStore)`), it will see two new entries.

---

### `BookCard` Props Change _(frontend component)_

**Previous signature:**
```jsx
<BookCard book={book} />
```

**New signature:**
```jsx
<BookCard
  book={book}
  isAdmin={boolean}      // NEW — required for admin action buttons
  token={string}         // NEW — required when isAdmin is true
  onDelete={fn}          // NEW — called with book.id after successful delete
  onUpdate={fn}          // NEW — called with updated book object after PATCH
/>
```

> **Impact:** `BookCard` is a private component used only inside `BooksPage`. No external consumers exist. However, any snapshot tests or shallow-render tests that render `<BookCard book={…} />` without the new props will still pass because the props are optional — admin action buttons simply will not render when `isAdmin` is falsy.

---

### `BooksPage` Callback Handlers Added _(internal)_

Two new callback handlers were added to manage local state after admin mutations:

```js
function handleBookDeleted(id)    // removes book from state by ID
function handleBookUpdated(book)  // replaces matching book in state array
```

These are internal implementation details and do not affect the public API or any consumer outside `BooksPage`.

---

## [v1.0.0] — Initial Release

- User authentication: `POST /api/auth/login`, `POST /api/auth/register`
- Books catalogue: `GET /api/books`, `GET /api/books/:id`, `POST /api/books`
- JWT-based route protection
- Role-based access control (`admin` vs `user`)
- React SPA with Login page, Book Catalog page, and Add Book modal

---

## Upgrade Guide: v1.0.0 → v1.1.0

No action is required for existing integrations. All changes in v1.1.0 are **additive**:

1. New `PATCH /api/books/:id` endpoint — opt-in usage.
2. New `DELETE /api/books/:id` endpoint — opt-in usage.
3. Updated `BookCard` component — new props are optional; existing renders are unchanged.

If you maintain external integration tests against the Books API, consider adding test cases for the new endpoints.
