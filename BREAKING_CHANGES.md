# Breaking Changes

This document tracks all breaking changes introduced in the Library Management System across releases. It follows [Semantic Versioning](https://semver.org/) — breaking changes increment the **MAJOR** version.

---

## [1.0.0] — Initial Release

> **Status:** Initial public release — no prior API to break.

This is the first production release of the Library Management System. All APIs and interfaces described here are newly established and represent the baseline contract.

### Established Contracts

The following interfaces are now considered stable. Future modifications to them will be documented as breaking changes.

#### Backend REST API

| Endpoint | Method | Auth Required | Role |
|---|---|---|---|
| `/api/health` | GET | No | Public |
| `/api/auth/login` | POST | No | Public |
| `/api/auth/register` | POST | No | Public |
| `/api/books` | GET | JWT | Any |
| `/api/books/:id` | GET | JWT | Any |
| `/api/books` | POST | JWT | Admin only |

#### JWT Token Shape (payload)

```json
{
  "id":    number,
  "email": string,
  "name":  string,
  "role":  "admin" | "user",
  "iat":   number,
  "exp":   number
}
```

#### `localStorage` Keys (Frontend)

| Key | Value |
|---|---|
| `lms_token` | Raw JWT string |
| `lms_user`  | JSON-serialised user object |

---

## Future Breaking Change Policy

The following types of changes **will** be declared as breaking and require a MAJOR version bump:

1. **Removing or renaming** an existing API endpoint
2. **Changing an endpoint's HTTP method** (e.g. PUT → PATCH)
3. **Removing a required or optional field** from a request/response body
4. **Changing a field's type** in a request or response
5. **Changing the JWT secret or algorithm** (invalidates all existing tokens)
6. **Renaming `localStorage` keys** (logs out all existing sessions)
7. **Changing role names** (`"admin"` → `"librarian"`, etc.)
8. **Removing a filterable query parameter** from `GET /api/books`

The following changes are **non-breaking** (minor or patch):

- Adding new optional fields to response bodies
- Adding new endpoints
- Adding new query parameters with backward-compatible defaults
- Performance improvements with identical observable behavior
- Internal refactors that don't change the public API

---

## Upcoming / Planned Breaking Changes

> None scheduled at this time.

If a breaking change is under consideration, it will appear in this section with its target version, rationale, and a migration path before it is released.

---

## Migration Guides

### Migrating to 1.0.0

This is the initial release — no migration is required.

---

*Last updated: 2024 — Library Management System v1.0.0*
