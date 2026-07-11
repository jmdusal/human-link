export type PayslipAdjustmentType = 'earning' | 'deduction';

export interface PayslipAdjustment {
    id: number;
    payslipId: number;
    type: PayslipAdjustmentType;
    label: string;
    amount: string | number;
    reason?: string | null;
    createdBy?: number | null;
    createdAt?: string;
    creator?: { id: number; name: string; email?: string } | null;
}

export interface PayslipAdjustmentFormData {
    type: PayslipAdjustmentType;
    label: string;
    amount: number;
    reason?: string;
}

export interface AttendanceBreakdownRow {
    id: number;
    date: string;
    totalMs: number;
    overtimeMs?: number;
    lateMs?: number;
    undertimeMs?: number;
    status: string;
}
