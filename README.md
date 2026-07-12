# HumanLink

HR platform for attendance, leave, payroll, workspaces, and people management.

```
human-link/
  humanlink/           React UI (port 5173)
  humanlink-api/       Laravel API (port 8000)
  docker-compose.yml   Full local stack
```

## Stack

| Layer | Tech |
|-------|------|
| UI | React 19, Vite, TypeScript, Tailwind, Axios, Sanctum cookies |
| API | Laravel 13, PHP 8.4, Sanctum, Spatie Permission, Reverb |
| Data | MySQL 8, Redis |

## Access model

| Actor | Scope |
|-------|--------|
| **super-admin** | Full access; can switch companies |
| **hr** | Company-wide people, leave, payroll, schedules |
| **manager** | Team reports, leave approve, schedules, calendar |
| **employee** | Own attendance, leave, payroll, workspaces |

- Each user belongs to **one company**. HR data, notifications, and activity logs are scoped by `company_id`.
- Day-to-day access comes from **user type**; Spatie roles are mainly `super-admin` (+ typed packs).
- Inside a workspace: **owner** > **admin** > **member** (super-admin can manage any workspace).

Company settings (profile + per-company SMTP): `/company-settings`

## Run with Docker

```bash
cp humanlink-api/.env.example humanlink-api/.env
# Set DB_HOST=mysql, REDIS_HOST=redis, APP_URL, FRONTEND_URL, SANCTUM_STATEFUL_DOMAINS

docker compose up -d --build
docker compose exec api composer install
docker compose exec api php artisan key:generate
docker compose exec api php artisan migrate --seed
docker compose exec api php artisan permission:cache-reset
```

| Service | URL |
|---------|-----|
| UI | http://localhost:5173 |
| API | http://localhost:8000 |
| phpMyAdmin | http://localhost:8080 |
| MySQL (host) | localhost:3307 |
| Reverb | http://localhost:8081 |

```bash
docker compose logs -f api
docker compose exec api php artisan migrate
docker compose down
```

## Run without Docker

```bash
docker compose up -d mysql redis   # optional infra only
# humanlink-api/.env → DB_HOST=127.0.0.1, DB_PORT=3307

cd humanlink-api && composer install && php artisan key:generate \
  && php artisan migrate --seed && php artisan permission:cache-reset \
  && php artisan serve --host=0.0.0.0 --port=8000

cd humanlink && npm install && npm run dev
```

Optional: `php artisan queue:work` (emails / queued jobs)

## Realtime notifications

In-app bell notifications (workspace invites, leave, tasks, etc.) update live over **Laravel Reverb** + **Echo**. Without Reverb they still save to the database — you just need a page reload to see new ones.

Set `BROADCAST_CONNECTION=reverb` plus matching `REVERB_*` values in `humanlink-api/.env`, and the same app key/port in `humanlink/.env` as `VITE_REVERB_*` if you override the UI defaults.

**With Docker** — `docker compose up` already starts the `reverb` service on port `8081`. Use `REVERB_HOST=reverb` so the API container can reach it.

**Without Docker** — use `REVERB_HOST=localhost` and start the websocket server yourself:

```bash
cd humanlink-api && php artisan reverb:start --host=0.0.0.0 --port=8081
```

## Seeded logins

Password for all: `password`

| Email | Access |
|-------|--------|
| admin@admin.com | super-admin |
| hr@user.com | hr |
| manager@user.com | manager |
| user@user.com | employee |

## Main modules

Auth · Attendance · Schedules · Leave · Payroll · Reports · Workspaces · Users · Dashboard · Company settings · Activity logs · Notifications
