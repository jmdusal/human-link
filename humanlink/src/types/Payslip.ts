import type { AttendanceBreakdownRow, PayslipAdjustment } from '@/types/PayslipAdjustment';

export interface PayslipUser {
    id: number;
    name: string;
    email: string;
    sssNumber?: string | null;
    philhealthNumber?: string | null;
    pagibigNumber?: string | null;
    tin?: string | null;
}

export interface Payslip {
    id: number;
    userId: number;
    year: number;
    month: number;
    periodStart: string;
    periodEnd: string;
    daysWorked: number;
    paidLeaveDays?: number | string;
    hoursWorked: string;
    monthlyRate: string;
    dailyRate: string;
    hourlyRate: string;
    allowanceMonthly: string;
    basicPay: string;
    allowancePay: string;
    overtimePay?: string | number;
    thirteenthMonthPay?: string | number;
    grossPay: string;
    sssEe?: string | number;
    sssEr?: string | number;
    philhealthEe?: string | number;
    philhealthEr?: string | number;
    pagibigEe?: string | number;
    pagibigEr?: string | number;
    withholdingTax?: string | number;
    otherDeductions?: string | number;
    totalDeductions?: string | number;
    netPay?: string | number;
    notes?: string | null;
    currency: string;
    generatedBy: number | null;
    generatedAt: string | null;
    createdAt: string;
    updatedAt: string;
    user?: PayslipUser;
    generator?: PayslipUser | null;
    adjustments?: PayslipAdjustment[];
    attendanceBreakdown?: AttendanceBreakdownRow[];
}

export interface PayrollMeta {
    year: number;
    month: number;
    generated?: number;
    skipped?: number;
}

export interface GeneratePayrollPayload {
    year: number;
    month: number;
}

export interface GenerateIndividualPayrollPayload {
    userId: number;
    year: number;
    month: number;
}

export interface PayrollDeduction {
    id: number;
    userId: number;
    name: string;
    amount: string | number;
    type: 'fixed' | 'recurring';
    isActive: boolean;
    startMonth?: number | null;
    startYear?: number | null;
    endMonth?: number | null;
    endYear?: number | null;
    user?: { id: number; name: string; email: string };
}
