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

Workspace roles (owner / admin / member) gate everything inside a workspace:

- super-admin: can list, open, and fully manage any workspace even without membership
- owner: full control, including archive/restore, transfer ownership, and hard delete
- admin: manage members, projects, statuses, tags, and tasks (create/delete); rename workspace; can leave
- member: update and move tasks only; can leave; only sees assigned projects

## Main flows

Auth: cookie login; UI loads roles and permissions from /api/user

Attendance: clock in out, breaks, disputes

Schedules: weekly shift patterns for HR, manager, admin

Leave: request, notify approvers, approve or reject, calendar, types and credits for HR

Payroll: monthly payslips, deductions, adjustments, PDF

Reports: attendance summary, leave utilization, payroll register, scoped by type

Workspaces: teams, members, projects, board, analytics, statuses, tags, settings

Users: people, rates, schedules, leave balances, role and user type, HR pipeline, invite/reset, deactivate vs offboard

Dashboard: overview for the signed in persona

## Users features (applied)

People list (`/users`):

- Views: list, grid, hire-date timeline
- Search + HR status filter on one row
- Columns include HR status and account `is_active` (Active badge)
- Create/edit: account, employment, government IDs, compensation, work schedule; optional invite email on create
- Profile and lifecycle modals (checklists, documents, contract generate, offboard)

HR status pipeline (`hrStatus` on user JSON):

| Status | Meaning |
|--------|---------|
| incomplete | Missing rate, schedule, or leave balances |
| ready | Setup done; invite / password / email verification still pending |
| active | Setup complete and account live |
| inactive | Soft-deactivated (access off, not terminated) |
| offboarding | Terminated or offboard checklist in progress |

Account access vs exit:

- **Deactivate** — `POST /users/{id}/deactivate`: revoke access and tokens; no termination date
- **Activate** — `POST /users/{id}/activate`: restore soft-deactivated users (blocked if offboarded)
- **Offboard** — `POST /users/{id}/offboard` (Lifecycle): termination date, revoke access, optional final payslip / leave payout

Invite and password:

- Create with `send_invite` sends reset-password invite email (`must_set_password`)
- **Resend invite** — `POST /users/{id}/resend-invite` when invite setup is still pending
- **Force password reset** — `POST /users/{id}/force-password-reset` for active accounts

Permissions: `users-view`, `users-create`, `users-edit`, `users-delete` (HR user type)

## Workspace features (applied)

Settings (workspace admin, not a stage list):

- Rename workspace (slug updates from name)
- Transfer ownership (owner only; previous owner becomes admin)
- Archive / restore (owner only)
- Hard delete (owner only)
- Leave workspace (admin and member; owners must transfer first)

Members and invitations:

- Invite existing users; pending pivot with token + email
- Accept / decline invitation
- Resend / cancel pending invites
- Role change (admin ↔ member)
- Invitation TTL (7 days); expired tokens rejected; daily `workspaces:expire-invitations` cleanup

Overview and analytics:

- Metrics use workspace `statuses` and task `assignees` (not legacy `task_statuses` / `assigned_to`)
- Done detection covers Done, Completed, Closed, Delivered, Approved, Finished

In-app notifications (database + broadcast, same pattern as leave):

- Workspace invitation
- Invitation accepted (owners/admins)
- Role changed
- Task assigned

ACL (workspace role guards — applied):

| Role | Can do |
|------|--------|
| super-admin | List/open/manage every workspace without being a member (API + UI bypass) |
| owner | Everything admin can, plus archive/restore, transfer ownership, and hard-delete workspace |
| admin | Invite/remove members, change roles, manage projects/statuses/tags, create/update/delete tasks, rename workspace; can leave (cannot archive/delete/transfer) |
| member | View workspace; only projects they are assigned to; update/move tasks only (no create/delete task; no Manage tabs); can leave |

Enforced on API and UI:

- Owner/admin: Manage menu (members, statuses, tags, settings), project CRUD/archive, status/tag CRUD, task create/delete
- Member: only projects they are assigned to; task update + board drag/move only; create/delete blocked in UI and return 403 from API
- Ownership cannot be changed via workspace update; only `POST /workspaces/{id}/transfer-ownership` (owner)
- Shared helpers: `ManagesWorkspaceAccess` (API), `useWorkspacePermissions` (UI)
- Projects tab manage actions use workspace role (not Spatie `projects-*` alone)
- Super-admin bypasses membership checks (sees all workspaces on index; full manage inside)
- Opening a workspace in the UI also allows super-admin even when not listed in members

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
