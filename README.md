# Human Link

## Project Architecture

```text
human-link/
├── frontend/ (React UI)         # Vite + TS
│   ├── src/
│   │   ├── api/                 # API client (Axios/React Query) & services
│   │   ├── components/          # Atomic UI (atoms, molecules, organisms)
│   │   ├── features/            # Feature-based logic (e.g., Auth, Profile)
│   │   ├── hooks/               # Reusable custom React hooks
│   │   ├── layouts/             # Page structures (Admin, Guest)
│   │   ├── pages/               # View components mapped to routes
│   │   ├── store/               # State (Zustand, Redux, or Context)
│   │   ├── types/               # Global TypeScript interfaces
│   │   └── utils/               # Pure helper functions
│   └── vite.config.ts           # Build & Alias configuration
│
└── backend/ (Laravel API)       # Stateless Backend
    ├── app/
    │   ├── Http/
    │   │   ├── Controllers/     # Returns JSON only (no Blade)
    │   │   ├── Requests/        # API validation logic
    │   │   └── Resources/       # JSON transformation layer
    │   └── Models/              # Eloquent database entities
    ├── database/                # Migrations, Seeders, & Factories
    ├── routes/
    │   └── api.php              # Core endpoint definitions
    └── .env                     # Database & Sanctum credentials

---

## Quick Start Guide

### Backend (Laravel 12)
The backend serves as a headless API.
*   **Install:** `composer install`
*   **Environment:** `cp .env.example .env` (Set `DB_DATABASE`, `APP_URL`)
*   **Database:** `php artisan migrate --seed`
*   **API Mode:** `php artisan install:api` (Ensures Sanctum/Passport is ready)
*   **Run:** `php artisan serve`

### Frontend (React + TypeScript)
The UI is a modern SPA built with Vite.
*   **Install:** `npm install`
*   **Environment:** `cp .env.example .env` (Set `VITE_API_URL=http://localhost:8000/api`)
*   **Run:** `npm run dev`

---

## Key Integration Details

### CORS Configuration
In the backend `config/cors.php`, authorize your frontend origin:
```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_origins' => ['http://localhost:5173'],
'supports_credentials' => true,


---

### 🐋 Docker Usage (Optional)
If you are running this project inside a Docker container (e.g., Laravel Sail), add the following to your root or backend `.env` to ensure correct file permissions:

```text
# Match these to your local user ID (usually 1000 on Linux)
UID=1000
GID=1000