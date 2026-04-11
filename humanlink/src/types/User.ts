import type { Role } from '@/types/Role';
import type { UserRate } from '@/types/UserRate';
import type { Schedule, WeeklyScheduleDay } from '@/types/Schedule';

export interface User {
    id: number;
    name: string;
    email: string;
    status: 'active' | 'inactive';
    timerStatus: 'working' | 'paused' | 'offline';
    color?: string;
    roles: Role[];
    rate?: UserRate;
    schedule?: Schedule;
    createdAt: string;
}

export interface UserFormData {
    name: string;
    email: string;
    password?: string;
    role: string;
    status: string;
    monthlyRate: string;
    dailyRate: string;
    hourlyRate: string;
    allowanceMonthly: string;
    effectiveDate: string;
    isActive: boolean;
    weeklyData: WeeklyScheduleDay[];
    scheduleStartDate: string;
}