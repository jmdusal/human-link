export interface DashboardKpis {
    activeUsers?: number;
    workingNow?: number;
    pendingLeaves?: number;
    openDisputes?: number;
    attendanceDaysMtd?: number;
    payslipsThisMonth?: number;
    grossPayrollMtd?: number;
    netPayrollMtd?: number;
    timerStatus?: string | null;
}

export interface LeaveActivityPoint {
    day: string;
    requests: number;
}

export interface RoleDistributionItem {
    name: string;
    count: number;
}

export interface DashboardActivityItem {
    id: number;
    description: string;
    subjectType?: string;
    causerName?: string;
    time?: string;
    createdAt?: string;
}

export interface DashboardSummary {
    scope: 'admin' | 'member';
    kpis: DashboardKpis;
    leaveActivity: LeaveActivityPoint[];
    roleDistribution: RoleDistributionItem[];
    recentActivity: DashboardActivityItem[];
}
