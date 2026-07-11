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
        MANAGERS: '/users/managers',
        STORE: '/users',
        UPDATE: (id: number) => `/users/${id}`,
        DELETE: (id: number) => `/users/${id}`,
        WORKSPACE_USERS: (workspaceId: number) => `/users/workspace/${workspaceId}`,
        PROJECT_USERS: (projectId: number) => `/users/project/${projectId}`,
        LIFECYCLE: (id: number) => `/users/${id}/lifecycle`,
        LIFECYCLE_TOGGLE: (userId: number, itemId: number) =>
            `/users/${userId}/lifecycle/items/${itemId}/toggle`,
        OFFBOARD: (id: number) => `/users/${id}/offboard`,
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
        ACCEPT_INVITATION: (token: string) => `/workspaces/invitations/${token}/accept`,
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
    TASK_ATTACHMENTS: {
        LIST: (taskId: number) => `/tasks/${taskId}/attachments`,
        STORE: (taskId: number) => `/tasks/${taskId}/attachments`,
        DELETE: (id: number) => `/tasks/attachments/${id}`,
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
    LEAVE_REQUESTS: {
        LIST: '/leave-requests',
        POLICY_OPTIONS: '/leave-requests/policy-options',
        CALENDAR: '/leave-requests/calendar',
        STORE: '/leave-requests',
        SHOW: (id: number) => `/leave-requests/${id}`,
        CONFLICTS: (id: number) => `/leave-requests/${id}/conflicts`,
        UPDATE: (id: number) => `/leave-requests/${id}`,
        APPROVE: (id: number) => `/leave-requests/${id}/approve`,
        REJECT: (id: number) => `/leave-requests/${id}/reject`,
        CANCEL: (id: number) => `/leave-requests/${id}/cancel`,
        DELETE: (id: number) => `/leave-requests/${id}`,
    },
    SCHEDULES: {
        LIST: '/schedules',
        STORE: '/schedules',
        SHOW: (id: number) => `/schedules/${id}`,
        UPDATE: (id: number) => `/schedules/${id}`,
        DELETE: (id: number) => `/schedules/${id}`,
    },
    DASHBOARD: {
        SUMMARY: '/dashboard',
    },
    ATTENDANCES: {
        LIST: '/attendances',
        STATUS: '/attendances/status',
        START: '/attendances/start',
        PAUSE: '/attendances/pause',
        RESUME: '/attendances/resume',
        END: '/attendances/end',
        CONTINUE: '/attendances/continue',
    },
    ATTENDANCE_DISPUTES: {
        LIST: '/attendance-disputes',
        STORE: '/attendance-disputes',
        APPROVE: (id: number) => `/attendance-disputes/${id}/approve`,
        REJECT: (id: number) => `/attendance-disputes/${id}/reject`,
    },
    PAYROLLS: {
        LIST: '/payrolls',
        SHOW: (id: number) => `/payrolls/${id}`,
        PDF: (id: number) => `/payrolls/${id}/pdf`,
        GENERATE: '/payrolls/generate',
        GENERATE_INDIVIDUAL: '/payrolls/generate-individual',
        GENERATE_13TH_MONTH: '/payrolls/generate-13th-month',
        ADJUSTMENTS: (id: number) => `/payrolls/${id}/adjustments`,
        DELETE_ADJUSTMENT: (payslipId: number, adjustmentId: number) =>
            `/payrolls/${payslipId}/adjustments/${adjustmentId}`,
        DELETE: (id: number) => `/payrolls/${id}`,
    },
    PAYROLL_DEDUCTIONS: {
        LIST: '/payroll-deductions',
        STORE: '/payroll-deductions',
        UPDATE: (id: number) => `/payroll-deductions/${id}`,
        DELETE: (id: number) => `/payroll-deductions/${id}`,
    },
    REPORTS: {
        ATTENDANCE_SUMMARY: '/reports/attendance-summary',
        LEAVE_UTILIZATION: '/reports/leave-utilization',
        PAYROLL_REGISTER: '/reports/payroll-register',
    },
    ME: {
        SHOW: '/me',
        UPDATE: '/me',
    },
    NOTIFICATIONS: {
        LIST: '/notifications',
        READ: (id: string) => `/notifications/${id}/read`,
        READ_ALL: '/notifications/read-all',
    },
} as const;