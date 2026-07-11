# HumanLink API

Laravel API for **HumanLink** — attendance, leave, payroll, workspaces, and HR admin.

Stack: Laravel 13 · PHP 8.4 · MySQL · Redis · Sanctum · Spatie Permission · Reverb

---

## Architecture (short)

| Layer | Role |
| --- | --- |
| Controllers | Thin: validate, call service, return JSON |
| Services (`app/Services`) | Business logic |
| Contracts (`app/Contracts`) | Service interfaces for DI |
| Models | Eloquent + relations |
| Middleware `permission` | Spatie permission gate; **super-admin bypasses all** |

Frontend lives in sibling `../humanlink` (Vite, port `5173`).

---

## Access model

**Roles (Spatie)** — only two:

| Role | Access |
| --- | --- |
| `super-admin` | Everything. No `user_type` needed. |
| `user` | Permissions come from **user type** |

**User types** (on role `user`):

| Type | Scope |
| --- | --- |
| `employee` | Own attendance, payroll, leave requests, reports; workspaces; no leave calendar / schedules admin |
| `manager` | Team via shared workspace members; leave approve/reject for those members; schedules + leave calendar |
| `hr` | Company-wide HR ops; Leaves admin; no Roles / Permissions / Activity Logs |
| _(null)_ | Used for `super-admin` only |

Permissions are synced from `user_type` on user create/update (`App\Support\UserTypePermissions`).

---

## Domain flows

| Flow | What it does |
| --- | --- |
| **Auth** | Sanctum cookie login/logout; `/api/user` returns roles + permissions |
| **Users** | Create/update people, rates, schedules, leave balances; assign role + user type |
| **Workspaces / Projects / Tasks** | Team spaces, membership, task boards |
| **Attendance** | Clock in/out, breaks, disputes |
| **Schedules** | Weekly shift patterns per user |
| **Leave** | Policies (types), credits, requests, approve/reject, calendar |
| **Payroll** | Monthly payslips, deductions, adjustments, PDF |
| **Reports** | Attendance summary, leave utilization, payroll register (scoped by user type) |
| **Dashboard** | Summary cards / charts for the signed-in role |
| **Activity logs** | Audit trail (super-admin) |
| **Notifications** | Leave submitted / pending reminders / forgotten timers |

Scheduled / console helpers:

- `leave:notify-pending-reminders` — remind approvers of stale pending leave
- `attendance:notify-forgotten-timers` — remind users with open timers (see `app/Console/Commands`)

---

## Requirements

**With Docker:** Docker + Docker Compose

**Without Docker:**

- PHP **8.4+** (extensions: `pdo_mysql`, `mbstring`, `pcntl`, `bcmath`, `gd`, …)
- Composer 2
- MySQL 8
- Redis (optional if you use `database` queue/cache)

---

## Run with Docker (recommended)

From the **monorepo root** (`human-link/`), not inside `humanlink-api/` alone:

```bash
# 1. Env
cp humanlink-api/.env.example humanlink-api/.env
# Edit humanlink-api/.env — for containers use:
#   DB_HOST=mysql
#   DB_PORT=3306
#   REDIS_HOST=redis
#   APP_URL=http://localhost:8000
#   FRONTEND_URL=http://localhost:5173
#   SANCTUM_STATEFUL_DOMAINS=localhost:5173

# 2. Start stack (API, UI, MySQL, Redis, queue, Reverb, phpMyAdmin)
docker compose up -d --build

# 3. Install + migrate + seed (inside API container)
docker compose exec api composer install
docker compose exec api php artisan key:generate
docker compose exec api php artisan migrate --seed
docker compose exec api php artisan permission:cache-reset
```

| Service | URL |
| --- | --- |
| API | http://localhost:8000 |
| UI | http://localhost:5173 |
| phpMyAdmin | http://localhost:8080 |
| MySQL (host) | `localhost:3307` → container `3306` |
| Reverb WS | http://localhost:8081 |

Useful:

```bash
docker compose exec api php artisan migrate
docker compose exec api php artisan db:seed --class=RoleSeeder
docker compose exec api php artisan queue:work
docker compose logs -f api
```

---

## Run without Docker

```bash
cd humanlink-api

cp .env.example .env
# Point DB/Redis at your local services, e.g.:
#   DB_HOST=127.0.0.1
#   DB_PORT=3306          # or 3307 if MySQL only runs in Docker
#   DB_DATABASE=human_link
#   DB_USERNAME=root
#   DB_PASSWORD=root
#   REDIS_HOST=127.0.0.1
#   APP_URL=http://localhost:8000
#   FRONTEND_URL=http://localhost:5173

composer install
php artisan key:generate
php artisan migrate --seed
php artisan permission:cache-reset

# API
php artisan serve --host=0.0.0.0 --port=8000

# Optional (other terminals)
php artisan queue:work
php artisan reverb:start --host=0.0.0.0 --port=8081
```

Create the MySQL database first if it does not exist:

```sql
CREATE DATABASE human_link CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

You can still run **only MySQL/Redis via Docker** and the API on the host:

```bash
# from monorepo root
docker compose up -d mysql redis
# then use DB_HOST=127.0.0.1 and DB_PORT=3307 in .env
```

---

## Seeded accounts

Password for all: `password`

| Email | Role | User type |
| --- | --- | --- |
| `admin@admin.com` | `super-admin` | — |
| `hr@user.com` | `user` | `hr` |
| `manager@user.com` | `user` | `manager` |
| `user@user.com` | `user` | `employee` |

---

## API basics

- Base URL: `http://localhost:8000/api`
- Auth: Sanctum SPA cookie (`POST /api/login` under `web` middleware)
- After login, call `GET /api/user` for roles + permissions
- Protected routes use `auth:sanctum` + `permission` middleware

Local mail / debug: Telescope at http://localhost:8000/telescope (when `TELESCOPE_ENABLED=true`).

---

## Common artisan commands

```bash
php artisan migrate
php artisan migrate:fresh --seed
php artisan db:seed --class=PermissionSeeder
php artisan db:seed --class=RoleSeeder
php artisan db:seed --class=UserSeeder
php artisan permission:cache-reset
php artisan leave:notify-pending-reminders
```

Via Docker, prefix with `docker compose exec api`.
