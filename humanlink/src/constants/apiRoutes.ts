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
        WORKSPACE_USERS: (workspaceId: number) => `/users/workspace/${workspaceId}`,
        PROJECT_USERS: (projectId: number) => `/users/project/${projectId}`,
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
    WORKSPACES:{
        LIST: '/workspaces',
        STORE: '/workspaces',
        UPDATE: (id: number) => `/workspaces/${id}`,
        DELETE: (id: number) => `/workspaces/${id}`,
        GET_BY_SLUG: (slug: string) => `/workspaces/${slug}`,
    },
    STATUSES: {
        LIST: '/statuses',
        STORE: '/statuses',
        REORDER: '/statuses/reorder',
        UPDATE: (id: number) => `/statuses/${id}`,
        DELETE: (id: number) => `/statuses/${id}`,
        
    },
    TAGS: {
        LIST: '/tags',
        STORE: '/tags',
        UPDATE: (id: number) => `/tags/${id}`,
        DELETE: (id: number) => `/tags/${id}`,
    },
    PROJECTS: {
        LIST: '/projects',
        STORE: '/projects',
        UPDATE: (id: number) => `/projects/${id}`,
        DELETE: (id: number) => `/projects/${id}`,
    },
    TASKS: {
        LIST: '/tasks',
        STORE: '/tasks',
        UPDATE: (id: number) => `/tasks/${id}`,
        DELETE: (id: number) => `/tasks/${id}`,
        UPDATE_POSITION: (id: number | string) => `/tasks/${id}/position`,
    },
    TASK_COMMENTS: {
        STORE: (id: number) => `/taskComments/${id}`,
        UPDATE: (id: number) => `/taskComments/${id}`,
        DELETE: (id: number) => `/taskComments/${id}`,
    },
    LEAVES: {
      LIST: '/leaves'  
    },
    LEAVE_BALANCES: {
        LIST: '/leave-balances',
        STORE: '/leave-balances',
        UPDATE: (id: number) => `/leave-balances/${id}`,
        DELETE: (id: number) => `/leave-balances/${id}`,
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