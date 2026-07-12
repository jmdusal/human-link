import type { Role } from '@/types/Role';
import type { UserRate } from '@/types/UserRate';
import type { UserDetail, EmploymentType } from '@/types/UserDetail';
import type { Schedule, WeeklyScheduleDay } from '@/types/Schedule';
import type { UserDocument } from '@/types/UserDocument';

export type UserType = string;
export type AccessScope = 'self' | 'workspace' | 'company';
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
    userTypeId?: number | null;
    accessScope?: AccessScope | null;
    assignedUserType?: {
        id: number;
        name: string;
        slug: string;
        accessScope: AccessScope;
    } | null;
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
    latestIdCard?: UserDocument | null;
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
    userTypeId: string;
    hiredAt: string;
    departmentId: string;
    positionId: string;
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
