import api from '@/api/axios';
import { API_ROUTES } from '@/constants';
import type { LeaveRequest, LeaveRequestFormData } from '@/types/LeaveRequest';
import type { LeavePolicy } from '@/types';

export const LeaveRequestService = {
    async getAllLeaveRequests(): Promise<LeaveRequest[]> {
        const response = await api.get(API_ROUTES.LEAVE_REQUESTS.LIST);
        return response.data.data;
    },

    async getLeaveRequest(id: number): Promise<LeaveRequest> {
        const response = await api.get(API_ROUTES.LEAVE_REQUESTS.SHOW(id));
        return response.data.data;
    },

    async getPolicyOptions(): Promise<LeavePolicy[]> {
        const response = await api.get(API_ROUTES.LEAVE_REQUESTS.POLICY_OPTIONS);
        return response.data.data;
    },

    async calendar(params?: { start?: string; end?: string; status?: string }): Promise<LeaveRequest[]> {
        const response = await api.get(API_ROUTES.LEAVE_REQUESTS.CALENDAR, { params });
        return response.data.data;
    },

    async conflicts(id: number): Promise<Array<{
        id: number;
        user: { id: number; name: string };
        startDate: string;
        endDate: string;
        status: string;
        policy: string | null;
    }>> {
        const response = await api.get(API_ROUTES.LEAVE_REQUESTS.CONFLICTS(id));
        return response.data.data;
    },

    async saveLeaveRequest(formData: LeaveRequestFormData, requestId?: number): Promise<LeaveRequest> {
        const payload = {
            leavePolicyId: Number(formData.leavePolicyId),
            startDate: formData.startDate,
            endDate: formData.endDate,
            halfDayType: formData.halfDayType,
            reason: formData.reason || null,
        };

        const response = requestId
            ? await api.put(API_ROUTES.LEAVE_REQUESTS.UPDATE(requestId), payload)
            : await api.post(API_ROUTES.LEAVE_REQUESTS.STORE, payload);

        return response.data.data;
    },

    async approveLeaveRequest(id: number, comment?: string): Promise<LeaveRequest> {
        const response = await api.post(API_ROUTES.LEAVE_REQUESTS.APPROVE(id), { comment });
        return response.data.data;
    },

    async rejectLeaveRequest(id: number, comment?: string): Promise<LeaveRequest> {
        const response = await api.post(API_ROUTES.LEAVE_REQUESTS.REJECT(id), { comment });
        return response.data.data;
    },

    async cancelLeaveRequest(id: number): Promise<LeaveRequest> {
        const response = await api.post(API_ROUTES.LEAVE_REQUESTS.CANCEL(id));
        return response.data.data;
    },

    async deleteLeaveRequest(id: number): Promise<void> {
        await api.delete(API_ROUTES.LEAVE_REQUESTS.DELETE(id));
    },
};
