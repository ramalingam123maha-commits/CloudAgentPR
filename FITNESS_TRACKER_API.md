# Fitness Tracker REST API Design

## Overview

A comprehensive REST API for a fitness tracking application that manages users, workouts, exercises, goals, nutrition, and health metrics.

**Base URL:** `https://api.fitnesstracker.com/v1`

---

## Core Principles

1. **Contract-first design** — All endpoints have typed schemas (TypeScript interfaces below)
2. **Consistent error semantics** — All errors follow the same shape
3. **Pagination on all list endpoints** — Prevents N+1 queries and poor UX at scale
4. **Partial updates via PATCH** — Only provided fields change
5. **Resource-oriented naming** — Plural nouns, no verbs in URLs
6. **Idempotent deletes** — Succeeds even if already deleted

---

## Error Response Format

All error responses follow this consistent structure:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {}
  }
}
```

**HTTP Status Codes:**

| Code | Meaning | Example |
|------|---------|---------|
| 400 | Bad Request | Malformed JSON |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate entry, version mismatch |
| 422 | Unprocessable Entity | Validation failed |
| 500 | Server Error | Internal error (no details exposed) |

---

## Authentication

All endpoints (except `/auth/register` and `/auth/login`) require Bearer token:

```
Authorization: Bearer <JWT_TOKEN>
```

Invalid or missing token → `401 Unauthorized`

---

## API Endpoints

### Auth Endpoints

#### POST `/auth/register`

Create a new user account.

**Request:**
```typescript
{
  email: string;           // Must be unique
  password: string;        // Min 8 chars, 1 uppercase, 1 number, 1 special char
  firstName: string;
  lastName: string;
  dateOfBirth?: string;    // ISO 8601: "1990-05-15"
}
```

**Response:** `201 Created`
```typescript
{
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  createdAt: string;       // ISO 8601 timestamp
  token: string;           // JWT
}
```

**Errors:**
- `422` VALIDATION_ERROR — Email invalid, password weak, required fields missing
- `409` EMAIL_EXISTS — Email already registered

---

#### POST `/auth/login`

Authenticate and receive JWT token.

**Request:**
```typescript
{
  email: string;
  password: string;
}
```

**Response:** `200 OK`
```typescript
{
  token: string;
  expiresIn: number;       // Seconds until expiration
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  }
}
```

**Errors:**
- `422` VALIDATION_ERROR — Email/password missing
- `401` INVALID_CREDENTIALS — Email not found or password incorrect

---

#### POST `/auth/refresh`

Refresh an expired token.

**Request:**
```typescript
{
  refreshToken: string;
}
```

**Response:** `200 OK`
```typescript
{
  token: string;
  expiresIn: number;
}
```

**Errors:**
- `401` INVALID_TOKEN — Refresh token invalid or expired

---

#### POST `/auth/logout`

Invalidate current session (optional client-side operation).

**Response:** `204 No Content`

---

### User Profile Endpoints

#### GET `/users/me`

Get current authenticated user's profile.

**Response:** `200 OK`
```typescript
{
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  gender?: "MALE" | "FEMALE" | "OTHER";
  height?: number;         // Centimeters
  weight?: number;         // Kilograms
  targetWeight?: number;
  activityLevel?: "SEDENTARY" | "LIGHTLY_ACTIVE" | "MODERATELY_ACTIVE" | "VERY_ACTIVE" | "EXTREMELY_ACTIVE";
  createdAt: string;
  updatedAt: string;
}
```

---

#### PATCH `/users/me`

Update user profile (partial).

**Request:**
```typescript
{
  firstName?: string;
  lastName?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  height?: number;
  weight?: number;
  targetWeight?: number;
  activityLevel?: "SEDENTARY" | "LIGHTLY_ACTIVE" | "MODERATELY_ACTIVE" | "VERY_ACTIVE" | "EXTREMELY_ACTIVE";
}
```

**Response:** `200 OK` — Updated user object (same as GET `/users/me`)

**Errors:**
- `422` VALIDATION_ERROR — Invalid field values

---

#### PATCH `/users/me/password`

Change password.

**Request:**
```typescript
{
  currentPassword: string;
  newPassword: string;     // Min 8 chars, 1 uppercase, 1 number, 1 special char
}
```

**Response:** `200 OK`
```typescript
{
  message: "Password updated successfully"
}
```

**Errors:**
- `401` INVALID_PASSWORD — Current password incorrect
- `422` VALIDATION_ERROR — New password doesn't meet requirements

---

### Workout Endpoints

#### GET `/workouts`

List user's workouts with pagination and filtering.

**Query Parameters:**
```
?page=1                    // Default: 1
&pageSize=20              // Default: 20, Max: 100
&sortBy=createdAt         // Options: createdAt, updatedAt, date, duration
&sortOrder=desc           // Options: asc, desc
&status=completed         // Options: completed, in_progress, cancelled
&startDate=2025-01-01     // ISO 8601 date filter
&endDate=2025-01-31
&workoutType=cardio       // Options: cardio, strength, flexibility, sports
```

**Response:** `200 OK`
```typescript
{
  data: [
    {
      id: string;
      userId: string;
      title: string;
      description?: string;
      type: "CARDIO" | "STRENGTH" | "FLEXIBILITY" | "SPORTS";
      date: string;        // ISO 8601 date
      startTime?: string;  // ISO 8601 datetime
      endTime?: string;    // ISO 8601 datetime
      duration?: number;   // Minutes
      caloriesBurned?: number;
      notes?: string;
      status: "COMPLETED" | "IN_PROGRESS" | "CANCELLED";
      exercises: string[]; // Array of exercise IDs
      createdAt: string;
      updatedAt: string;
    }
  ],
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  }
}
```

**Errors:**
- `422` VALIDATION_ERROR — Invalid query parameters

---

#### POST `/workouts`

Create a new workout.

**Request:**
```typescript
{
  title: string;           // 1-100 chars
  description?: string;
  type: "CARDIO" | "STRENGTH" | "FLEXIBILITY" | "SPORTS";
  date: string;            // ISO 8601 date
  startTime?: string;      // ISO 8601 datetime
  endTime?: string;
  duration?: number;       // Minutes
  caloriesBurned?: number;
  notes?: string;
  status?: "COMPLETED" | "IN_PROGRESS" | "CANCELLED"; // Default: "IN_PROGRESS"
  exercises?: string[];    // Array of exercise IDs
}
```

**Response:** `201 Created`
```typescript
// Same as GET `/workouts/:id` response
{
  id: string;
  userId: string;
  title: string;
  // ... (full object)
}
```

**Errors:**
- `422` VALIDATION_ERROR — Missing required fields or invalid data
- `404` NOT_FOUND — Referenced exercise doesn't exist

---

#### GET `/workouts/:id`

Get a specific workout with all exercises.

**Response:** `200 OK`
```typescript
{
  id: string;
  userId: string;
  title: string;
  description: string | null;
  type: "CARDIO" | "STRENGTH" | "FLEXIBILITY" | "SPORTS";
  date: string;
  startTime: string | null;
  endTime: string | null;
  duration: number | null;
  caloriesBurned: number | null;
  notes: string | null;
  status: "COMPLETED" | "IN_PROGRESS" | "CANCELLED";
  exercises: Array<{
    id: string;
    name: string;
    sets?: number;
    reps?: number;
    weight?: number;
    duration?: number;
    distance?: number;
    notes?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}
```

**Errors:**
- `404` NOT_FOUND — Workout doesn't exist or unauthorized access

---

#### PATCH `/workouts/:id`

Update a workout (partial update).

**Request:**
```typescript
{
  title?: string;
  description?: string;
  type?: "CARDIO" | "STRENGTH" | "FLEXIBILITY" | "SPORTS";
  date?: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  caloriesBurned?: number;
  notes?: string;
  status?: "COMPLETED" | "IN_PROGRESS" | "CANCELLED";
  exercises?: string[]; // Replace all exercises with this list
}
```

**Response:** `200 OK` — Updated workout object

**Errors:**
- `404` NOT_FOUND — Workout doesn't exist
- `422` VALIDATION_ERROR — Invalid field values
- `403` FORBIDDEN — User doesn't own this workout

---

#### DELETE `/workouts/:id`

Delete a workout (idempotent — succeeds even if already deleted).

**Response:** `204 No Content`

---

### Exercise Endpoints

#### GET `/exercises`

List available exercises with pagination.

**Query Parameters:**
```
?page=1
&pageSize=20
&sortBy=name              // Options: name, createdAt
&sortOrder=asc
&muscleGroup=chest        // Options: chest, back, legs, shoulders, arms, core, cardio
&type=strength            // Options: strength, cardio, flexibility
&search=bench             // Text search in name and description
```

**Response:** `200 OK`
```typescript
{
  data: [
    {
      id: string;
      name: string;
      description?: string;
      type: "STRENGTH" | "CARDIO" | "FLEXIBILITY";
      muscleGroups: string[]; // chest, back, legs, shoulders, arms, core, etc.
      difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
      instructions?: string;
      createdAt: string;
      updatedAt: string;
    }
  ],
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  }
}
```

---

#### POST `/exercises`

Create a custom exercise (system exercises are read-only).

**Request:**
```typescript
{
  name: string;
  description?: string;
  type: "STRENGTH" | "CARDIO" | "FLEXIBILITY";
  muscleGroups?: string[];
  difficulty?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  instructions?: string;
}
```

**Response:** `201 Created` — Exercise object

---

#### GET `/exercises/:id`

Get a specific exercise.

**Response:** `200 OK` — Exercise object

---

#### PATCH `/exercises/:id`

Update a custom exercise (can only update own exercises).

**Request:**
```typescript
{
  name?: string;
  description?: string;
  type?: "STRENGTH" | "CARDIO" | "FLEXIBILITY";
  muscleGroups?: string[];
  difficulty?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  instructions?: string;
}
```

**Response:** `200 OK` — Updated exercise object

**Errors:**
- `403` FORBIDDEN — Cannot modify system exercises or other users' exercises

---

#### DELETE `/exercises/:id`

Delete a custom exercise.

**Response:** `204 No Content`

**Errors:**
- `403` FORBIDDEN — Cannot delete system exercises or other users' exercises

---

### Goals Endpoints

#### GET `/goals`

List user's fitness goals with pagination.

**Query Parameters:**
```
?page=1
&pageSize=20
&sortBy=createdAt         // Options: createdAt, dueDate, priority
&sortOrder=desc
&status=active            // Options: active, completed, cancelled
&category=weight_loss     // Options: weight_loss, muscle_gain, endurance, flexibility, strength
```

**Response:** `200 OK`
```typescript
{
  data: [
    {
      id: string;
      userId: string;
      title: string;
      description?: string;
      category: "WEIGHT_LOSS" | "MUSCLE_GAIN" | "ENDURANCE" | "FLEXIBILITY" | "STRENGTH";
      status: "ACTIVE" | "COMPLETED" | "CANCELLED";
      priority: "LOW" | "MEDIUM" | "HIGH";
      startDate: string;    // ISO 8601 date
      targetDate: string;
      targetValue?: number; // Weight (kg), distance (km), etc.
      currentValue?: number;
      unit?: string;        // "kg", "km", "lbs", etc.
      progress?: number;    // 0-100 percentage
      createdAt: string;
      updatedAt: string;
    }
  ],
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  }
}
```

---

#### POST `/goals`

Create a new fitness goal.

**Request:**
```typescript
{
  title: string;
  description?: string;
  category: "WEIGHT_LOSS" | "MUSCLE_GAIN" | "ENDURANCE" | "FLEXIBILITY" | "STRENGTH";
  priority?: "LOW" | "MEDIUM" | "HIGH"; // Default: "MEDIUM"
  startDate: string;
  targetDate: string;
  targetValue?: number;
  unit?: string;
}
```

**Response:** `201 Created` — Goal object

---

#### GET `/goals/:id`

Get a specific goal.

**Response:** `200 OK` — Goal object

---

#### PATCH `/goals/:id`

Update a goal (partial).

**Request:**
```typescript
{
  title?: string;
  description?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH";
  targetDate?: string;
  targetValue?: number;
  currentValue?: number;
  status?: "ACTIVE" | "COMPLETED" | "CANCELLED";
}
```

**Response:** `200 OK` — Updated goal object

---

#### DELETE `/goals/:id`

Delete a goal.

**Response:** `204 No Content`

---

### Nutrition Endpoints

#### GET `/nutrition/logs`

List nutrition logs with pagination.

**Query Parameters:**
```
?page=1
&pageSize=20
&sortBy=date              // Options: date, createdAt
&sortOrder=desc
&startDate=2025-01-01     // ISO 8601 date
&endDate=2025-01-31
```

**Response:** `200 OK`
```typescript
{
  data: [
    {
      id: string;
      userId: string;
      date: string;        // ISO 8601 date
      meals: Array<{
        id: string;
        type: "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";
        name: string;
        calories: number;
        protein?: number;  // Grams
        carbs?: number;
        fat?: number;
        fiber?: number;
        timestamp: string;
      }>;
      totalCalories: number;
      totalProtein?: number;
      totalCarbs?: number;
      totalFat?: number;
      createdAt: string;
      updatedAt: string;
    }
  ],
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  }
}
```

---

#### POST `/nutrition/logs`

Log a meal.

**Request:**
```typescript
{
  date: string;           // ISO 8601 date
  type: "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  timestamp?: string;     // ISO 8601 datetime, default: now
}
```

**Response:** `201 Created` — Meal object

---

#### GET `/nutrition/logs/:date`

Get nutrition log for a specific date.

**Response:** `200 OK` — Nutrition log object for that date

---

#### DELETE `/nutrition/logs/:mealId`

Delete a meal entry.

**Response:** `204 No Content`

---

### Health Metrics Endpoints

#### GET `/metrics`

List health metrics with pagination.

**Query Parameters:**
```
?page=1
&pageSize=20
&sortBy=date              // Options: date, createdAt
&sortOrder=desc
&type=heart_rate          // Options: heart_rate, blood_pressure, sleep, water_intake, steps
&startDate=2025-01-01
&endDate=2025-01-31
```

**Response:** `200 OK`
```typescript
{
  data: [
    {
      id: string;
      userId: string;
      type: "HEART_RATE" | "BLOOD_PRESSURE" | "SLEEP" | "WATER_INTAKE" | "STEPS";
      value: number | {
        systolic?: number;  // For BLOOD_PRESSURE
        diastolic?: number;
      };
      unit: string;        // "bpm", "mmHg", "hours", "ml", "steps"
      date: string;        // ISO 8601 date
      timestamp?: string;  // ISO 8601 datetime
      notes?: string;
      createdAt: string;
      updatedAt: string;
    }
  ],
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  }
}
```

---

#### POST `/metrics`

Record a health metric.

**Request:**
```typescript
{
  type: "HEART_RATE" | "BLOOD_PRESSURE" | "SLEEP" | "WATER_INTAKE" | "STEPS";
  value: number | {
    systolic?: number;
    diastolic?: number;
  };
  date?: string;          // Default: today
  timestamp?: string;     // ISO 8601 datetime
  notes?: string;
}
```

**Response:** `201 Created` — Metric object

---

#### GET `/metrics/:id`

Get a specific metric.

**Response:** `200 OK` — Metric object

---

#### PATCH `/metrics/:id`

Update a metric.

**Request:**
```typescript
{
  value?: number | { systolic?: number; diastolic?: number };
  notes?: string;
  timestamp?: string;
}
```

**Response:** `200 OK` — Updated metric object

---

#### DELETE `/metrics/:id`

Delete a metric.

**Response:** `204 No Content`

---

### Dashboard / Summary Endpoints

#### GET `/dashboard/summary`

Get user's fitness summary (cached, updated daily).

**Response:** `200 OK`
```typescript
{
  user: {
    id: string;
    name: string;
    currentWeight?: number;
    targetWeight?: number;
    weightProgress?: number; // kg difference
  };
  thisWeek: {
    totalWorkouts: number;
    totalDuration: number;   // Minutes
    totalCaloriesBurned: number;
    caloriesConsumed: number;
  };
  thisMonth: {
    totalWorkouts: number;
    totalDuration: number;
    totalCaloriesBurned: number;
    averageCaloriesPerDay: number;
  };
  stats: {
    activeGoals: number;
    completedGoals: number;
    currentStreak?: number;  // Days
  };
  recentWorkouts: Array<{ id: string; title: string; date: string }>;
  upcomingGoals: Array<{ id: string; title: string; targetDate: string }>;
}
```

---

#### GET `/dashboard/stats`

Get detailed fitness statistics and trends.

**Query Parameters:**
```
?startDate=2025-01-01
&endDate=2025-01-31
&metric=calories            // Options: calories, workouts, duration, heart_rate, weight
```

**Response:** `200 OK`
```typescript
{
  metric: string;
  period: { startDate: string; endDate: string };
  data: Array<{
    date: string;
    value: number;
  }>;
  summary: {
    min: number;
    max: number;
    average: number;
    trend: "UP" | "DOWN" | "STABLE";
  };
}
```

---

## TypeScript Interface Definitions

### Core Types

```typescript
// Branded types for type safety
type UserId = string & { readonly __brand: 'UserId' };
type WorkoutId = string & { readonly __brand: 'WorkoutId' };
type ExerciseId = string & { readonly __brand: 'ExerciseId' };
type GoalId = string & { readonly __brand: 'GoalId' };

// Enums
type WorkoutType = 'CARDIO' | 'STRENGTH' | 'FLEXIBILITY' | 'SPORTS';
type ExerciseType = 'STRENGTH' | 'CARDIO' | 'FLEXIBILITY';
type WorkoutStatus = 'COMPLETED' | 'IN_PROGRESS' | 'CANCELLED';
type GoalCategory = 'WEIGHT_LOSS' | 'MUSCLE_GAIN' | 'ENDURANCE' | 'FLEXIBILITY' | 'STRENGTH';
type GoalStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
type MetricType = 'HEART_RATE' | 'BLOOD_PRESSURE' | 'SLEEP' | 'WATER_INTAKE' | 'STEPS';

// Input types
interface CreateUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
}

interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  height?: number;
  weight?: number;
  targetWeight?: number;
  activityLevel?: 'SEDENTARY' | 'LIGHTLY_ACTIVE' | 'MODERATELY_ACTIVE' | 'VERY_ACTIVE' | 'EXTREMELY_ACTIVE';
}

interface CreateWorkoutInput {
  title: string;
  description?: string;
  type: WorkoutType;
  date: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  caloriesBurned?: number;
  notes?: string;
  status?: WorkoutStatus;
  exercises?: ExerciseId[];
}

interface CreateExerciseInput {
  name: string;
  description?: string;
  type: ExerciseType;
  muscleGroups?: string[];
  difficulty?: Difficulty;
  instructions?: string;
}

interface CreateGoalInput {
  title: string;
  description?: string;
  category: GoalCategory;
  priority?: Priority;
  startDate: string;
  targetDate: string;
  targetValue?: number;
  unit?: string;
}

// Output types
interface User {
  id: UserId;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  height?: number;
  weight?: number;
  targetWeight?: number;
  activityLevel?: string;
  createdAt: string;
  updatedAt: string;
}

interface Workout {
  id: WorkoutId;
  userId: UserId;
  title: string;
  description: string | null;
  type: WorkoutType;
  date: string;
  startTime: string | null;
  endTime: string | null;
  duration: number | null;
  caloriesBurned: number | null;
  notes: string | null;
  status: WorkoutStatus;
  exercises: Exercise[];
  createdAt: string;
  updatedAt: string;
}

interface Exercise {
  id: ExerciseId;
  name: string;
  description: string | null;
  type: ExerciseType;
  muscleGroups: string[];
  difficulty: Difficulty;
  instructions: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Goal {
  id: GoalId;
  userId: UserId;
  title: string;
  description: string | null;
  category: GoalCategory;
  status: GoalStatus;
  priority: Priority;
  startDate: string;
  targetDate: string;
  targetValue: number | null;
  currentValue: number | null;
  unit: string | null;
  progress: number; // 0-100 percentage
  createdAt: string;
  updatedAt: string;
}

interface Metric {
  id: string;
  userId: UserId;
  type: MetricType;
  value: number | { systolic: number; diastolic: number };
  unit: string;
  date: string;
  timestamp?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

interface APIError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
```

---

## Design Decisions

| Decision | Rationale | Alternative |
|----------|-----------|-------------|
| **PATCH for partial updates** | Clients only send changed fields; full object (PUT) requires sending everything | Full object replacement (PUT) — more error-prone |
| **Pagination on all lists** | Prevents 10,000 items in a single response; scales naturally | No pagination — breaks at scale |
| **Branded types for IDs** | Prevents accidentally passing WorkoutId where ExerciseId is expected | Regular string IDs — easy to mix up |
| **Status codes (422 for validation)** | Distinguishes semantic validation errors from malformed JSON (400) | Always return 400 — vague |
| **Activity level enum** | Consistent, finite set of values; easier for client UI | Free-form string — creates confusion |
| **Consistent error format** | Consumers can parse all errors the same way; easier error handling | Different error shapes per endpoint — unpredictable |
| **ISO 8601 for dates/times** | Standard, unambiguous format; language-agnostic parsing | Unix timestamps — loses timezone info |
| **Separate create/update inputs** | Prevents sending server-generated fields; clear contracts | Same input type for both — confusing |

---

## Validation Rules

### At API Boundaries (Required)

- Email format validation
- Password strength: minimum 8 characters, 1 uppercase, 1 number, 1 special character
- Numeric fields: positive values where applicable (calories, duration, weight)
- Date fields: ISO 8601 format
- Enum fields: must be one of the defined values
- String fields: min/max length constraints
- Array fields: max item count constraints

### Internal Code (Trust After Validation)

- Internal function calls trust their inputs
- Database-backed data is considered valid
- No re-validation between internal layers

---

## Rate Limiting

(Optional but recommended for production)

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1735689600
```

**Limits:**
- Authenticated users: 1000 requests per hour
- Auth endpoints: 10 requests per 5 minutes (to prevent brute force)

---

## Versioning Strategy

- API version in URL: `/v1/`, `/v2/` (not in headers)
- New features added as optional fields (backward compatible)
- Breaking changes require new major version
- Old versions supported for minimum 2 years
- Deprecation notice sent 6 months before removal

---

## Security Considerations

1. **HTTPS only** — All endpoints must use TLS
2. **JWT tokens** — Signed, expiring, with refresh mechanism
3. **Input validation** — All external input validated at boundaries
4. **Authorization** — Users can only access their own data
5. **Rate limiting** — Prevent abuse and brute force attacks
6. **CORS** — Restrict to known client origins
7. **Secrets** — Never logged or exposed in error messages
8. **Password storage** — Bcrypt with salt (min cost factor 10)

---

## Testing Strategy

### Test Coverage Checklist

- [ ] **Authentication**: Valid/invalid credentials, expired tokens, refresh flow
- [ ] **Authorization**: User A cannot access User B's data
- [ ] **Input validation**: Empty strings, invalid enums, out-of-range numbers
- [ ] **Error responses**: Consistent format across all error types
- [ ] **Pagination**: Page boundaries, invalid page numbers
- [ ] **Filtering**: Multiple filters combined, no results
- [ ] **PATCH idempotence**: Multiple updates, partial updates
- [ ] **DELETE idempotence**: Delete twice, succeeds both times
- [ ] **Timestamps**: Created/updated dates are valid ISO 8601

### Example Test Cases

```typescript
// Auth
✓ POST /auth/register with valid data creates user and returns token
✓ POST /auth/register with duplicate email returns 409
✓ POST /auth/login with wrong password returns 401
✓ POST /auth/refresh with expired token returns 401

// Workouts
✓ GET /workouts returns paginated list
✓ GET /workouts?page=999 returns empty data (not 404)
✓ POST /workouts with missing title returns 422
✓ PATCH /workouts/:id updates only provided fields
✓ DELETE /workouts/:id twice succeeds both times
✓ User A cannot GET User B's workout (403)

// Error consistency
✓ All 400-level errors include error.code and error.message
✓ 500 errors never include internal implementation details
```

---

## API Documentation Tools

Recommended tools for implementation:

- **OpenAPI / Swagger** — Generate interactive API docs
- **TypeScript + ts-rest** — Ensure types stay in sync
- **zod** — Runtime validation at API boundaries
- **jest** — Comprehensive test coverage
- **Postman / Insomnia** — Manual testing and examples

---

## Completion Verification Checklist

- [x] Every endpoint has typed input and output schemas
- [x] Error responses follow a single consistent format (error.code, error.message)
- [x] Validation happens at system boundaries (API routes)
- [x] All list endpoints support pagination
- [x] New fields are additive and optional (backward compatible)
- [x] Naming follows consistent conventions (camelCase for fields, plural nouns in URLs)
- [x] Endpoints use PATCH for partial updates
- [x] Delete operations are idempotent (succeed even if already deleted)
- [x] ID types are branded to prevent confusion
- [x] Status codes are semantically correct (400 vs 422 vs 401 vs 403 vs 404)
