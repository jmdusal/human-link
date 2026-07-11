import type { Role } from '@/types/Role';
import type { UserRate } from '@/types/UserRate';
import type { UserDetail, EmploymentType } from '@/types/UserDetail';
import type { Schedule, WeeklyScheduleDay } from '@/types/Schedule';
import type { UserDocument } from '@/types/UserDocument';

export type UserType = 'employee' | 'hr' | 'manager';
export type HrStatus = 'incomplete' | 'ready' | 'active' | 'inactive' | 'offboarding';

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
    hrStatus?: HrStatus;
    isActive?: boolean;
    mustSetPassword?: boolean;
    emailVerifiedAt?: string | null;
    hasTwoFactorEnabled?: boolean;
    userType?: UserType | null;
    hiredAt?: string | null;
    terminatedAt?: string | null;
    timerStatus: 'working' | 'paused' | 'offline';
    color?: string;
    roles: Role[];
    details?: UserDetail | null;
    rate?: UserRate;
    schedule?: Schedule;
    documents?: UserDocument[];
    latestContract?: UserDocument | null;
    currentBalances?: UserLeaveBalanceSummary[];
    createdAt: string;
}

export interface UserFormData {
    name: string;
    email: string;
    password?: string;
    sendInvite?: boolean;
    role: string;
    status: string;
    userType: UserType | '';
    hiredAt: string;
    jobTitle: string;
    department: string;
    employmentType: EmploymentType | '';
    mobile: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    emergencyContactRelationship: string;
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
