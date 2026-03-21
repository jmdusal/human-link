export const API_ROUTES = {
    AUTH: {
        LOGIN: '/login',
        LOGOUT: '/logout',
    },
    ACTIVITY_LOGS: {
        LIST: '/activity-logs'
    },
    USERS: {
        LIST: '/users',
        STORE: '/users',
        UPDATE: (id: number) => `/users/${id}`,
        DELETE: (id: number) => `/users/${id}`,
    },
    ROLES: {
        LIST: '/roles',
        STORE: '/roles',
        UPDATE: (id: number) => `/roles/${id}`,
        DELETE: (id: number) => `/roles/${id}`,
    },
    PERMISSIONS: {
        LIST: '/permissions',
        STORE: '/permissions',
        UPDATE: (id: number) => `/permissions/${id}`,
        DELETE: (id: number) => `/permissions/${id}`,
    },
    LEAVE_POLICIES: {
        LIST: '/leave-policies',
        STORE: '/leave-policies',
        UPDATE: (id: number) => `/leave-policies/${id}`,
        DELETE: (id: number) => `/leave-policies/${id}`,
    },
    SCHEDULES: {
        LIST: '/schedules',
    }
} as const;