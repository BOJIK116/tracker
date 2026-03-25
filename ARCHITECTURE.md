# Architecture

## Overview

The application follows a classic SPA + API architecture:

```
[React SPA]
      ↓
[Laravel API]
      ↓
[MySQL Database]
```

Frontend is responsible for UI and interaction.  
Backend handles business logic, authentication, and data integrity.

---

## Backend Structure

### Controllers

Controllers handle HTTP requests and orchestrate the flow:

- DirectionController
- TrackerWeekController
- TrackerMarkController
- TrackerStreaksController

Responsibilities:
- validate request
- call business logic
- return JSON response

---

### Policies (Authorization)

Authorization is handled via Laravel Policies.

Example:

```
DirectionPolicy::delete

ALLOW if:
user.id === direction.user_id
```

Usage in controller:

```php
$this->authorize('delete', $direction);
```

---

### Models

Core models:

- User
- Direction
- Track

Relationships:

```
User
 ├── hasMany Directions
 ├── hasMany Tracks

Direction
 ├── belongsTo User
 └── hasMany Tracks

Track
 ├── belongsTo User
 └── belongsTo Direction
```

---

## Data Flow

### 1. Create Direction

```
[React]
   ↓
POST /api/directions
   ↓
[Laravel Controller]
   ├─ validate input
   ├─ generate slug
   ├─ attach user_id
   ↓
[DB: directions]
```

---

### 2. Mark Day (Tracker)

```
[React]
   ↓
POST /api/tracker/mark
   ↓
[Laravel]
   ├─ validate request
   ├─ check ownership (user_id)
   ├─ updateOrCreate track
   ↓
[DB: tracks]
```

---

### 3. Load Week (Core Feature)

```
[React]
   ↓
GET /api/tracker/week?year=YYYY&week=WW
   ↓
[Laravel]
   ├─ Fetch directions (user scoped)
   ├─ Fetch tracks (user scoped)
   ├─ Build weekly grid
   ↓
JSON Response:
{
  year,
  week,
  days[],
  rows[]
}
```

---

## Security Model

The application enforces strict multi-user isolation:

```
[Auth] → Sanctum (Bearer token)

[Access Control]
   ├─ Policies (authorization)
   ├─ user_id filters in queries
   └─ no access to чужие данные
```

Rules:

- Users can access only their own data
- Unauthorized actions return 403 Forbidden
- No data leakage between users

---

## Database Design

### directions

```
id
user_id
name
slug
timestamps
```

Constraint:

```
UNIQUE(user_id, slug)
```

---

### tracks

```
id
user_id
direction_id
iso_year
iso_week
iso_weekday
completed
timestamps
```

Key idea:
- One record = one day of tracking

---

## Key Design Decisions

### 1. ISO Week System

Tracking is based on:

```
iso_year
iso_week
iso_weekday (1–7)
```

Why:
- simplifies weekly views
- avoids timezone issues
- consistent structure

---

### 2. Idempotent Writes

```php
updateOrCreate(...)
```

Benefits:
- safe repeated requests
- no duplicates
- ideal for toggle UI

---

### 3. Multi-user Isolation

Every query includes:

```php
where('user_id', $userId)
```

Prevents:
- data leaks
- unauthorized access

---

### 4. Policy-based Authorization

Instead of:

```
if (user_id !== current_user)
```

Use:

```php
$this->authorize(...)
```

Benefits:
- cleaner controllers
- centralized security logic

---

## Testing Strategy

Feature tests simulate real API usage:

```
[Test Flow]

create users
   ↓
create data
   ↓
authenticate (Sanctum)
   ↓
send HTTP requests
   ↓
assert JSON + database
```

Covered scenarios:

- multi-user isolation
- cannot access чужие данные
- cannot delete чужие directions
- cannot mark чужие directions
- slug uniqueness
- weekly aggregation correctness

---

## Scalability Notes

The architecture is ready for growth:

```
- Mobile app (same API)
- Public API
- Queues (jobs)
- Notifications
- Microservices split
```

---

## Summary

This project demonstrates:

- API-first architecture
- secure multi-user system
- clean separation of concerns
- test-driven backend design
- production-ready patterns