# Tracker

Multi-user habit tracker built as a React single-page application with a Laravel API.

Users can create directions, mark daily progress, browse ISO weeks, monitor streaks, and
manage personal notes and todo items.

## Features

- Registration, login, logout, and Bearer token authentication
- Per-user data isolation
- Habit direction creation and deletion
- Weekly progress grid with previous and next week navigation
- Optimistic daily mark updates
- Current and best streak statistics
- Personal notes with create, edit, and delete actions
- Todo list with active and completed items
- Responsive terminal-inspired interface
- Interactive Artisan commands for tracker management

## Tech Stack

### Backend

- PHP 8.2+
- Laravel 12
- Laravel Sanctum
- MySQL
- Pest 4
- Laravel Pint

### Frontend

- React 19
- Vite 8
- Tailwind CSS 4 tooling
- Fetch API
- Prettier

Node.js 22.12 or newer is recommended for the current frontend toolchain.

## Requirements

- PHP 8.2+
- Composer
- Node.js 22.12+
- npm
- MySQL 8+

## Installation

```bash
git clone <repository-url>
cd tracker

composer install
npm ci

cp .env.example .env
php artisan key:generate
```

Create a MySQL database and configure the connection in `.env`:

```dotenv
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=tracker
DB_USERNAME=root
DB_PASSWORD=
```

Run the migrations:

```bash
php artisan migrate
```

## Development

Start Laravel, the queue listener, log viewer, and Vite together:

```bash
composer run dev
```

Alternatively, run the backend and frontend separately:

```bash
php artisan serve
npm run dev
```

The application is available at the URL printed by `php artisan serve`.

## Available Scripts

```bash
# Build frontend assets
npm run build

# Format JS, JSX, and CSS
npm run format

# Check frontend formatting
npm run format:check

# Format PHP
vendor/bin/pint

# Check PHP formatting
vendor/bin/pint --test

# Run PHP tests
composer test
```

## Testing

Tests use the `tracker_test` MySQL database configured in `phpunit.xml`.

Create it before running the suite:

```sql
CREATE DATABASE tracker_test;
```

Run all tests:

```bash
php artisan test
```

The current feature suite covers authentication boundaries, per-user direction and tracker
isolation, direction creation and deletion, weekly results, marks, and slug uniqueness.

## API

Public endpoints:

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/ping` | Health check |
| `POST` | `/api/register` | Create an account |
| `POST` | `/api/login` | Authenticate and receive a token |

Authenticated endpoints require a Sanctum Bearer token:

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/logout` | Revoke the current token |
| `GET` | `/api/me` | Get the authenticated user |
| `GET` | `/api/directions` | List directions |
| `POST` | `/api/directions` | Create a direction |
| `DELETE` | `/api/directions/{direction}` | Delete a direction |
| `GET` | `/api/tracker/week` | Load an ISO week |
| `POST` | `/api/tracker/mark` | Create or update a daily mark |
| `GET` | `/api/tracker/streaks` | Load streak statistics |
| `GET` | `/api/notes` | List notes |
| `POST` | `/api/notes` | Create a note |
| `GET` | `/api/notes/{note}` | Get a note |
| `PUT/PATCH` | `/api/notes/{note}` | Update a note |
| `DELETE` | `/api/notes/{note}` | Delete a note |
| `GET` | `/api/todos` | List todo items |
| `POST` | `/api/todos` | Create a todo item |
| `GET` | `/api/todos/{todo}` | Get a todo item |
| `PUT/PATCH` | `/api/todos/{todo}` | Update a todo item |
| `DELETE` | `/api/todos/{todo}` | Delete a todo item |

Example weekly request:

```text
GET /api/tracker/week?year=2026&week=25
```

## Artisan Commands

```bash
# Add a direction
php artisan tracker:add-direction "Development"

# Delete a direction by slug
php artisan tracker:delete-direction development

# Interactively update today's marks for a user
php artisan tracker:fill-today --user=1

# Render an ISO week in the terminal
php artisan tracker:show-week --user=1 --year=2026 --week=25

# Show current and best streaks
php artisan tracker:streaks --user=1 --days=400
```

The add and delete commands currently operate with their built-in user assumptions. Prefer
the authenticated web interface when managing data in a multi-user environment.

## Security

- API authentication is handled by Laravel Sanctum.
- Protected queries are scoped to the authenticated user.
- Direction ownership is enforced through authorization policies.
- Tracks, notes, and todos are isolated by `user_id`.
- Security-focused feature tests run against MySQL.

## Continuous Integration

The GitHub Actions workflow in `.github/workflows/ci.yml` runs on every push and pull request:

1. Installs PHP and npm dependencies.
2. Starts a MySQL 8.4 service.
3. Checks PHP formatting with Pint.
4. Checks frontend formatting with Prettier.
5. Runs the PHP test suite.
6. Builds production frontend assets.
7. Runs `npm audit --audit-level=high`.

## Project Structure

```text
app/
  Console/Commands/       Artisan tracker commands
  Http/Controllers/Api/  JSON API controllers
  Http/Requests/          Request validation
  Models/                 Eloquent models
  Policies/               Authorization rules
  Services/               Tracker services

resources/
  css/                    Application styles
  js/app/                 React application entry
  js/components/          Reusable UI components
  js/hooks/               Tracker, note, and todo state hooks
  js/lib/                 API, authentication, and date helpers
  js/pages/               Application pages

tests/
  Feature/Api/            API and isolation tests
  Unit/                   Unit tests
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for additional backend and data-flow notes.
