# Tracker

Multi-user habit tracker built with Laravel + React.

Users can create habits (directions), track daily progress, and view weekly statistics with streaks.

---

## Tech Stack

Backend:
- Laravel (latest)
- Laravel Sanctum (API authentication)
- MySQL

Frontend:
- React (Vite)
- Fetch API

---

## Features

- User authentication (register/login/logout)
- Multi-user data isolation
- Create and manage habits (directions)
- Daily tracking (mark completed / not completed)
- Weekly overview (grid view)
- Streak tracking (current / best)
- Slug generation with per-user uniqueness
- Secure API with authorization policies

---

## Security

- Sanctum Bearer token authentication
- All data scoped by user_id
- Users can:
  - see only their own data
  - modify only their own directions
- Unauthorized actions return 403 Forbidden
- Policies used for authorization

---

## Testing

Feature tests cover:

- multi-user isolation
- direction access control
- tracker security
- slug uniqueness
- weekly aggregation logic

Run tests:

```bash
php artisan test --env=testing
```

---

## API Overview

Auth:
- POST /api/register
- POST /api/login
- POST /api/logout
- GET /api/me

Directions:
- GET /api/directions
- POST /api/directions
- DELETE /api/directions/{id}

Tracker:
- GET /api/tracker/week
- POST /api/tracker/mark
- GET /api/tracker/streaks

---

## Database Structure

directions:

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

tracks:

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

---

## Setup

```bash
git clone <repo>
cd tracker

composer install
npm install

cp .env.example .env
php artisan key:generate

# configure DB

php artisan migrate
php artisan serve
npm run dev
```

---

## Testing Setup

Create test database:

```sql
CREATE DATABASE tracker_test;
```

Run tests:

```bash
php artisan test
```

---

## Project Status

Backend is production-ready:
- secure
- tested
- scalable

Frontend is functional and ready for UI improvements.

---

## Future Improvements

- API Resources
- Pagination & filters
- Rate limiting
- Docker
- CI/CD
- Deployment

---

## Author

Portfolio project