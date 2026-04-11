import type { LeaveBalance, LeaveBalanceFormData } from '@/types';
import { getCurrentYear } from '@/utils/dateUtils';

export const INITIAL_LEAVE_BALANCE_FORM_STATE: LeaveBalanceFormData = {
    userId: '',
    leavePolicyId: '',
    allowed: '0.00',
    used: '0.00',
    year: getCurrentYear(),
};

export const formatLeaveBalanceFormData = (balance: LeaveBalance): LeaveBalanceFormData => ({
    userId: balance.userId,
    leavePolicyId: balance.leavePolicyId,
    allowed: Number(balance.allowed || 0).toFixed(2),
    used: Number(balance.used || 0).toFixed(2),
    year: balance.year,
});

// export const formatLeaveBalanceFormData = (balance: LeaveBalance): LeaveBalanceFormData => {
//     return {
//         userId: balance.userId,
//         leavePolicyId: balance.leavePolicyId,
//         allowed: Number(balance.allowed || 0).toFixed(2),
//         used: Number(balance.used || 0).toFixed(2),
//         year: balance.year,
//     };
// };
