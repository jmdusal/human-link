import type { LeaveRequest, LeaveRequestFormData } from '@/types/LeaveRequest';
import { getToday } from '@/utils/dateUtils';

export const HALF_DAY_OPTIONS = [
    { value: 'none', label: 'Full day(s)' },
    { value: 'morning', label: 'Half day (morning)' },
    { value: 'afternoon', label: 'Half day (afternoon)' },
];

export const INITIAL_LEAVE_REQUEST_FORM_STATE: LeaveRequestFormData = {
    leavePolicyId: '',
    startDate: getToday(),
    endDate: getToday(),
    halfDayType: 'none',
    reason: '',
};

export const formatLeaveRequestFormData = (request: LeaveRequest): LeaveRequestFormData => ({
    leavePolicyId: String(request.leavePolicyId),
    startDate: request.startDate?.slice(0, 10) || getToday(),
    endDate: request.endDate?.slice(0, 10) || getToday(),
    halfDayType: request.halfDayType || 'none',
    reason: request.reason || '',
});
