import type { LeavePolicy } from '@/types/LeavePolicy';
import type { User } from '@/types/User';

export interface LeaveBalance {
    id: number;
    userId: number;
    leavePolicyId: number;
    allowed: string;
    used: string;
    remaining: number;
    year: number;
    user?: User;
    leavePolicy?: LeavePolicy;
    createdAt: string;
}

export interface GroupedLeaveBalance {
    userId: number;
    userName: string;
    userEmail: string;
    totalAllowed: number;
    totalUsed: number;
    totalRemaining: number;
    policies: LeaveBalance[];
}

export interface LeaveBalanceFormData {
    userId: number | string;
    leavePolicyId: number | string;
    allowed: string;
    used: string;
    year: number | string;
}