# Laravel 12 + React TypeScript Project

A decoupled full-stack application featuring a stateless Laravel API and a modular React frontend.

## 🏗 Architecture

### Backend (Laravel 12)
- **Location:** `/api`
- **Auth:** Laravel Sanctum (Token-based)
- **Key Commands:**
  - `php artisan serve` - Start the API server
  - `php artisan migrate` - Run database migrations
  - `php artisan migrate --seed` - Run database migrations with default admin

### Frontend (React + TypeScript)
- **Location:** `/ui`
- **Tooling:** Vite + TypeScript
- **State Management:** (Axios + React Hooks)

## 📁 UI Folder Structured
src/
├── api/
│   ├── configs/
│   │   └── routes.ts          # Dynamic sidebar & UI routing config
│   └── axios.ts               # Global Axios instance & interceptors
├── constants/
│   └── apiRoutes.ts           # Centralized API endpoint strings
├── pages/
│   └── Authentication/
│       ├── AuthProvider.tsx   # Auth context/state provider
│       ├── SanctumConfig.ts   # Laravel Sanctum specific integration
│       └── withPermission.tsx # HOC for permission-based guarding
└── types/
    └── models/
        ├── permissions.ts     # Permission interfaces
        ├── roles.ts           # Role interfaces
        └── user.ts            # User model interfaces


- **`src/types/models/`**: Centralized TypeScript interfaces (User, Roles, Permissions) ensuring type safety across the app.
- **`src/api/axios.ts`**: Global Axios configuration including base URL and interceptors for handling 401/Unauthorized errors.
- **`src/api/configs/routes.ts`**: Configuration for dynamic sidebar navigation and UI routing.
- **`src/constants/apiRoutes.ts`**: A single source of truth for all API endpoint strings (e.g., `USERS: '/api/v1/users'`).
- **`src/pages/Authentication/`**: Contains the Auth provider, Sanctum integration, and High-Order Components (HOCs) for permission-based route guarding.

## 🚀 Getting Started

1. **Backend Setup:**
   ```bash
   cd api
   composer install
   cp .env.example .env
   php artisan key:generate
   
2. **Frontend Setup::**
    ```bash
    cd ui
    npm install