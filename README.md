# Human Link

A high-performance decoupled application.

---

Project Architecture
human-link/
├── humanlink/ (React UI)       # Independent Frontend (Vite + TS)
│   ├── src/
│   │   ├── api/                # API client (Axios/React Query) & services
│   │   ├── components/         # Atomic UI (atoms, molecules, organisms)
│   │   ├── features/           # Feature-based logic (e.g., Auth, Profile)
│   │   ├── hooks/              # Reusable custom React hooks
│   │   ├── layouts/            # Page structures (Admin, Guest)
│   │   ├── pages/              # View components mapped to routes
│   │   ├── store/              # State (Zustand, Redux, or Context)
│   │   ├── types/              # Global TypeScript interfaces
│   │   └── utils/              # Pure helper functions
│   └── vite.config.ts          # Build & Alias configuration
│
└── human-link/ (Laravel API)   # Stateless Backend
    ├── app/
    │   ├── Http/
    │   │   ├── Controllers/    # Returns JSON only (no Blade)
    │   │   ├── Requests/       # API validation logic
    │   │   └── Resources/      # JSON transformation layer
    │   └── Models/             # Eloquent database entities
    ├── database/               # Migrations, Seeders, & Factories
    ├── routes/
    │   └── api.php             # Core endpoint definitions
    └── .env                    # Database & Sanctum credentials

---

## Quick Start Guide

### 1. Backend (Laravel 12)
The backend serves as a headless API.
*   **Install:** `composer install`
*   **Environment:** `cp .env.example .env` (Set `DB_DATABASE`, `APP_URL`)
*   **Database:** `php artisan migrate --seed`
*   **API Mode:** `php artisan install:api` (Ensures Sanctum/Passport is ready)
*   **Run:** `php artisan serve`

### 2. Frontend (React + TypeScript)
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


