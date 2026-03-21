import type { User } from '@/types/models/User';

export interface WeeklyScheduleDay {
    dayOfWeek: number;
    shiftStart: string;
    shiftEnd: string;
    isRestDay: boolean;
    isNightShift: boolean;
}

export interface Schedule {
    id: number;
    userId: number;
    user?: Pick<User, 'id' | 'name'>;
    startDate: string;
    endDate: string | null;
    breakMinutes: number;
    weeklyData?: WeeklyScheduleDay[]; 
    createdAt?: string;
}