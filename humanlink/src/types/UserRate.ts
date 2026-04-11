export interface UserRate {
    id: number;
    userId: number;
    monthlyRate: string;
    dailyRate: string;
    hourlyRate: string;
    allowanceMonthly: string;
    effectiveDate: string;
    isActive: boolean;
}