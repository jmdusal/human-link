import type { Attendance, AttendanceUser } from '@/types/Attendance';

export type AttendanceDisputeStatus = 'pending' | 'approved' | 'rejected';

export interface AttendanceDispute {
    id: number;
    attendanceId: number;
    userId: number;
    reason: string;
    proposedTotalMs?: number | null;
    proposedOvertimeMs?: number | null;
    status: AttendanceDisputeStatus;
    resolutionNote?: string | null;
    reviewedBy?: number | null;
    reviewedAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
    attendance?: Attendance;
    user?: AttendanceUser;
    reviewer?: AttendanceUser | null;
}

export interface AttendanceDisputeFormData {
    attendanceId: number;
    reason: string;
    proposedTotalMs?: number | null;
    proposedOvertimeMs?: number | null;
}
