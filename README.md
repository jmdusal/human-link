# HumanLink

HR platform for attendance, leave, payroll, workspaces, and people management.

```
human-link/
  humanlink/           React UI (port 5173)
  humanlink-api/       Laravel API (port 8000)
  docker-compose.yml   Full local stack
```

More API detail: humanlink-api/README.md

## Stack

UI: React 19, Vite, TypeScript, Tailwind, Axios, Sanctum cookies

API: Laravel 13, PHP 8.4, Sanctum, Spatie Permission, Reverb

Data: MySQL 8, Redis

## Access model

super-admin: full access, no user type needed

employee: own attendance, payroll, leave requests, reports, workspaces

manager: workspace member reports and leave approve, schedules, leave calendar

hr: company wide HR, leave admin, users; no roles, permissions, or activity logs

Roles are only super-admin and user. Day to day access comes from user type.

## Main flows

Auth: cookie login; UI loads roles and permissions from /api/user

Attendance: clock in out, breaks, disputes

Schedules: weekly shift patterns for HR, manager, admin

Leave: request, notify approvers, approve or reject, calendar, types and credits for HR

Payroll: monthly payslips, deductions, adjustments, PDF

Reports: attendance summary, leave utilization, payroll register, scoped by type

Workspaces: teams, members, projects, tasks

Users: people, rates, schedules, leave balances, role and user type

Dashboard: overview for the signed in persona

## Run with Docker

From this repo root:

```
cp humanlink-api/.env.example humanlink-api/.env
```

In humanlink-api/.env set:

```
DB_HOST=mysql
DB_PORT=3306
REDIS_HOST=redis
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
SANCTUM_STATEFUL_DOMAINS=localhost:5173
```

Optional Linux volume permissions:

```
UID=1000
GID=1000
```

Then:

```
docker compose up -d --build
docker compose exec api composer install
docker compose exec api php artisan key:generate
docker compose exec api php artisan migrate --seed
docker compose exec api php artisan permission:cache-reset
```

URLs:

UI http://localhost:5173

API http://localhost:8000

phpMyAdmin http://localhost:8080

MySQL from host localhost:3307

Reverb http://localhost:8081

```
docker compose logs -f api
docker compose exec api php artisan migrate
docker compose down
```

## Run without Docker

### Database and Redis

Use local MySQL 8 and Redis, or start only infra in Docker:

```
docker compose up -d mysql redis
```

Then in humanlink-api/.env use DB_HOST=127.0.0.1 and DB_PORT=3307

### API

```
cd humanlink-api
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
php artisan permission:cache-reset
php artisan serve --host=0.0.0.0 --port=8000
```

Optional:

```
php artisan queue:work
php artisan reverb:start --port=8081
```

### UI

```
cd humanlink
npm install
npm run dev
```

API base URL defaults to http://localhost:8000/api

## Seeded logins

Password: password

admin@admin.com    super-admin

hr@user.com        user / hr

manager@user.com   user / manager

user@user.com       user / employee

## Folder map

```
humanlink/
  src/api/               Axios client
  src/pages/             Route screens
  src/components/        Shared UI
  src/routes/routes.tsx  Nav and pages
  src/context/           Auth

humanlink-api/
  app/Http/Controllers/  Controllers
  app/Services/          Business logic
  app/Contracts/         Service interfaces
  app/Support/           Helpers
  database/              Migrations and seeders
  routes/api.php         Endpoints
```
