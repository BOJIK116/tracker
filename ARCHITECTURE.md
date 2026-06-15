# Architecture

## Overview

Tracker is a single-page React application backed by a JSON API:

```text
[React SPA]
     |
     | Fetch API + Bearer token
     v
[Laravel API]
     |
     | Eloquent
     v
[MySQL]
```

The browser owns presentation state and user interaction. Laravel owns authentication,
validation, authorization, persistence, ISO week aggregation, and streak calculations.

The application currently contains three user-facing domains:

- Directions and daily tracker marks
- Notes
- Todo items

## Request Lifecycle

```text
React component
    |
    v
Custom hook
    |
    v
resources/js/lib/api.js
    |
    v
Laravel route + auth:sanctum
    |
    v
Form Request / Controller / Service
    |
    v
Eloquent model + MySQL
    |
    v
JSON response
```

Public authentication routes issue Sanctum personal access tokens. The frontend stores the
current token in `localStorage` and sends it in the `Authorization: Bearer ...` header.

## Backend

### Routes

API routes are defined in `routes/api.php`.

Public routes:

```text
GET  /api/ping
POST /api/register
POST /api/login
```

Authenticated routes are grouped under the `auth:sanctum` middleware and expose:

- Current user and logout
- Direction index, creation, and deletion
- Weekly tracker data and daily marks
- Streak statistics
- CRUD operations for notes
- CRUD operations for todos

### Controllers

```text
AuthController
  register, login, logout, current user

DirectionController
  list, create, and delete directions

TrackerWeekController
  build the seven-day tracker grid

TrackerMarkController
  validate ownership and persist a daily mark

TrackerStreaksController
  coordinate streak calculation

NoteController
  note CRUD operations

TodoController
  todo CRUD operations
```

The tracker week, mark, and streak controllers are single-purpose endpoints. Notes and todos
use Laravel API resource routes.

### Validation

Input validation is primarily handled by Form Request classes:

```text
Api/Auth/LoginRequest
Api/Auth/RegisterRequest
Api/TrackerMarkRequest
Api/TrackerStreaksRequest
Api/TrackerWeekRequest
DirectionStoreRequest
StoreNoteRequest
StoreTodoRequest
UpdateTodoRequest
```

`NoteController::update` currently validates its payload directly in the controller.

### Services

`StreakService` contains streak-specific business logic outside the HTTP layer.

It:

1. Loads marks for a user, a set of directions, and a bounded date window.
2. Converts ISO year/week/weekday tuples into calendar dates.
3. Builds an in-memory status map.
4. Calculates current and best consecutive completion counts.

This keeps streak calculations reusable by both the API and Artisan commands.

### Authorization

Authentication is enforced by Sanctum middleware.

Ownership is enforced in several ways:

- Direction lists and weekly marks are filtered by `user_id`.
- Direction deletion uses `DirectionPolicy::delete`.
- Tracker mark creation verifies that the direction belongs to the authenticated user.
- Note and todo controllers compare the resource `user_id` with `auth()->id()`.
- Database foreign keys cascade user and direction deletions.

Authorization is not yet fully centralized: directions use a policy, while notes and todos
perform ownership checks inside their controllers.

## Frontend

### Application Entry

```text
resources/js/app/main.jsx
    |
    v
resources/js/app/App.jsx
```

`App` selects one of three UI states:

1. Initial boot/loading state
2. Authentication page
3. Authenticated weekly tracker page

### State Management

The application uses local React state and custom hooks instead of a global state library.

```text
useTrackerApp
  authentication
  selected ISO week
  weekly grid
  streaks
  pending tracker marks
  top-level loading and error state

useNotes
  note collection
  load, create, update, delete

useTodos
  todo collection
  load, create, toggle, update, delete
```

`useTrackerApp` composes `useNotes` and `useTodos`, then exposes a single interface to
`App.jsx`.

The selected ISO week is persisted in `localStorage`. Arrow keys move between weeks, and
future dates cannot be marked from the UI.

### Component Structure

```text
App
├── AuthPage
└── WeekPage
    ├── CreateDirectionForm
    ├── WeekGrid
    ├── WeekStats
    ├── NotesPanel
    │   ├── ItemActionsMenu
    │   └── ConfirmModal
    ├── TodoPanel
    │   ├── ItemActionsMenu
    │   └── ConfirmModal
    └── ConfirmModal
```

`ItemActionsMenu` is shared by notes and todos. Dropdown positioning can be configured to
open upward so menus near the bottom of the viewport remain visible.

### API Client

`resources/js/lib/api.js` is a small wrapper around the browser Fetch API.

It:

- Prefixes requests with `/api`
- Adds JSON headers
- Adds the Sanctum Bearer token when present
- Serializes request bodies
- Parses JSON responses
- Converts failed responses into JavaScript errors

Domain helper functions for notes and todos are defined alongside the generic `api` function.

### Optimistic Tracker Updates

Daily marks use an optimistic update:

```text
User toggles a cell
    |
    v
Update local weekly state immediately
    |
    v
POST /api/tracker/mark
    |
    +-- success --> reload authoritative week data
    |
    +-- failure --> restore previous weekly state and show an error
```

A `Set` of pending keys prevents a mark from appearing idle while its request is in flight.

## Core Data Flows

### Authentication

```text
Register or login form
    |
    v
POST /api/register or /api/login
    |
    v
Sanctum creates a personal access token
    |
    v
Token stored in localStorage
    |
    v
GET /api/me + weekly application data
```

Logout revokes the current access token and clears all user-scoped frontend state.

### Create Direction

```text
CreateDirectionForm
    |
    v
POST /api/directions
    |
    v
DirectionStoreRequest validates the name
    |
    v
Controller generates a per-user unique slug
    |
    v
Direction saved with authenticated user_id
    |
    v
Weekly data reloaded
```

### Load Week

```text
GET /api/tracker/week?year=YYYY&week=WW
    |
    v
Validate ISO year and week
    |
    v
Load authenticated user's directions
    |
    v
Load marks for the requested ISO week
    |
    v
Build seven dates and one status row per direction
```

Response shape:

```json
{
  "year": 2026,
  "week": 25,
  "days": [
    {
      "iso_weekday": 1,
      "date": "2026-06-15"
    }
  ],
  "rows": [
    {
      "direction": {
        "id": 1,
        "slug": "development",
        "name": "Development"
      },
      "statuses": {
        "1": true,
        "2": false
      }
    }
  ]
}
```

### Mark Day

```text
POST /api/tracker/mark
    |
    v
Validate direction_id, date, and completed
    |
    v
Verify direction ownership
    |
    v
Convert date to ISO year/week/weekday
    |
    v
Track::updateOrCreate(...)
```

The database uniqueness constraint and `updateOrCreate` make repeated writes idempotent.

### Notes and Todos

```text
NotesPanel / TodoPanel
    |
    v
useNotes / useTodos
    |
    v
REST endpoint
    |
    v
Ownership check + validation
    |
    v
Update local collection from returned resource
```

Todo completion is represented by the `is_done` boolean. Completed todos remain available
in a collapsible section instead of being removed.

## Database

### Core Tables

```text
users
  id
  name
  email
  password
  timestamps

directions
  id
  user_id
  name
  slug
  timestamps

tracks
  id
  user_id
  direction_id
  iso_year
  iso_week
  iso_weekday
  completed
  timestamps

notes
  id
  user_id
  title
  content
  timestamps

todos
  id
  user_id
  title
  is_done
  timestamps

personal_access_tokens
  Sanctum API tokens
```

### Relationships

```text
User 1 --- * Direction
User 1 --- * Track
User 1 --- * Note
User 1 --- * Todo

Direction 1 --- * Track
```

The database enforces these relationships with foreign keys. The current Eloquent models
explicitly expose `User -> notes`, `User -> todos`, `Direction -> tracks`,
`Track -> direction`, `Note -> user`, and `Todo -> user`. Other database relationships are
queried directly where needed.

### Important Constraints

```text
directions:
  UNIQUE(user_id, slug)

tracks:
  one mark per user, direction, ISO year, ISO week, and ISO weekday
```

Foreign keys use cascading deletes, so deleting a user removes owned records and deleting a
direction removes its tracker marks.

## ISO Week Model

Marks are stored as:

```text
iso_year
iso_week
iso_weekday (1 through 7)
```

This representation matches the primary weekly UI and avoids recalculating week membership
for every query. Calendar dates are reconstructed with Carbon on the backend and helper
functions on the frontend.

The ISO year is stored separately because days near New Year can belong to a week-year that
differs from the calendar year.

## Artisan Interface

Console commands provide an additional interface to tracker data:

```text
tracker:add-direction
tracker:delete-direction
tracker:fill-today
tracker:show-week
tracker:streaks
```

The week and streak commands reuse tracker concepts from the web application. Some commands
still default to user ID `1`, so the authenticated API remains the primary multi-user
interface.

## Testing

The current Pest suite contains API-focused unit and feature tests.

Feature test flow:

```text
Create users and records
    |
    v
Authenticate with Sanctum
    |
    v
Send API requests
    |
    v
Assert response and database state
```

Covered behavior includes:

- Direction isolation between users
- Rejection of cross-user direction deletion
- Rejection of marks against another user's direction
- Per-user slug uniqueness
- Weekly rows and completed statuses
- Successful direction creation and tracker marking

The test environment uses a dedicated MySQL database named `tracker_test`.

## Continuous Integration

`.github/workflows/ci.yml` runs on pushes and pull requests.

```text
GitHub Actions
├── PHP 8.3
├── Node.js 22
├── MySQL 8.4
├── Composer install
├── npm ci
├── Pint formatting check
├── Prettier formatting check
├── Pest/PHP test suite
├── Vite production build
└── npm security audit
```

## Current Boundaries

- React state is local to custom hooks; there is no global store.
- The API returns Eloquent models and purpose-built arrays rather than API Resources.
- Authorization is split between policies, scoped queries, and controller checks.
- `TrackerStreaksController` scopes loaded marks by user, but its direction query is not yet
  scoped by `user_id`.
- Notes and todos do not yet have dedicated feature coverage.
- The main stylesheet remains a single application-level file.
- Artisan direction commands are not fully user-aware.

These are useful extension points if the application grows, but they do not require new
abstractions for the current project size.
