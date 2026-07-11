import type { Role } from '@/types/Role';
import type { UserRate } from '@/types/UserRate';
import type { Schedule, WeeklyScheduleDay } from '@/types/Schedule';

export type UserType = 'employee' | 'manager';

export interface UserLeaveBalanceSummary {
    id: number;
    userId: number;
    leavePolicyId: number;
    allowed: string | number;
    used: string | number;
    remaining?: number;
    year: number;
    leavePolicy?: { id: number; name: string };
}

export interface User {
    id: number;
    name: string;
    email: string;
    status: 'active' | 'inactive';
    userType?: UserType | null;
    sssNumber?: string | null;
    philhealthNumber?: string | null;
    pagibigNumber?: string | null;
    tin?: string | null;
    timerStatus: 'working' | 'paused' | 'offline';
    color?: string;
    roles: Role[];
    rate?: UserRate;
    schedule?: Schedule;
    currentBalances?: UserLeaveBalanceSummary[];
    createdAt: string;
}

export interface UserFormData {
    name: string;
    email: string;
    password?: string;
    role: string;
    status: string;
    userType: UserType | '';
    sssNumber: string;
    philhealthNumber: string;
    pagibigNumber: string;
    tin: string;
    monthlyRate: string;
    dailyRate: string;
    hourlyRate: string;
    allowanceMonthly: string;
    effectiveDate: string;
    isActive: boolean;
    weeklyData: WeeklyScheduleDay[];
    scheduleStartDate: string;
}
