import api from '@/api/axios';
import { API_ROUTES } from '@/constants';
import type { AttendanceDispute, AttendanceDisputeFormData } from '@/types/AttendanceDispute';

export const AttendanceDisputeService = {
    async list(params?: { status?: string }): Promise<AttendanceDispute[]> {
        const response = await api.get(API_ROUTES.ATTENDANCE_DISPUTES.LIST, { params });
        return response.data.data;
    },

    async create(payload: AttendanceDisputeFormData): Promise<AttendanceDispute> {
        const response = await api.post(API_ROUTES.ATTENDANCE_DISPUTES.STORE, payload);
        return response.data.data;
    },

    async approve(id: number, resolutionNote?: string): Promise<AttendanceDispute> {
        const response = await api.post(API_ROUTES.ATTENDANCE_DISPUTES.APPROVE(id), {
            resolutionNote,
        });
        return response.data.data;
    },

    async reject(id: number, resolutionNote?: string): Promise<AttendanceDispute> {
        const response = await api.post(API_ROUTES.ATTENDANCE_DISPUTES.REJECT(id), {
            resolutionNote,
        });
        return response.data.data;
    },
};
