export type LeaveRequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
export type HalfDayType = 'none' | 'morning' | 'afternoon';

export interface LeaveRequestUser {
    id: number;
    name: string;
    email: string;
    userType?: 'employee' | 'hr' | 'manager' | null;
}

export interface LeaveRequestPolicy {
    id: number;
    name: string;
    slug: string;
    isPaid?: boolean | number;
}

export interface LeaveRequest {
    id: number;
    userId: number;
    leavePolicyId: number;
    startDate: string;
    endDate: string;
    totalDays: number | string;
    halfDayType: HalfDayType;
    reason?: string | null;
    status: LeaveRequestStatus;
    comment?: string | null;
    approvedBy?: number | null;
    approvedAt?: string | null;
    createdAt: string;
    updatedAt?: string;
    user?: LeaveRequestUser;
    leavePolicy?: LeaveRequestPolicy;
    approver?: LeaveRequestUser | null;
}

export interface LeaveRequestFormData {
    leavePolicyId: string;
    startDate: string;
    endDate: string;
    halfDayType: HalfDayType;
    reason: string;
}
