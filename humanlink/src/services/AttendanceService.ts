import api from '@/api/axios';
import { API_ROUTES } from '@/constants';
import type { Attendance, AttendanceTimerState } from '@/types';

export const AttendanceService = {
    async list(params?: { start?: string; end?: string }): Promise<Attendance[]> {
        const response = await api.get(API_ROUTES.ATTENDANCES.LIST, { params });
        return response.data.data;
    },

    async status(): Promise<AttendanceTimerState> {
        const response = await api.get(API_ROUTES.ATTENDANCES.STATUS);
        return response.data.data;
    },

    async start(): Promise<AttendanceTimerState> {
        const response = await api.post(API_ROUTES.ATTENDANCES.START);
        return response.data.data;
    },

    async pause(): Promise<AttendanceTimerState> {
        const response = await api.post(API_ROUTES.ATTENDANCES.PAUSE);
        return response.data.data;
    },

    async resume(): Promise<AttendanceTimerState> {
        const response = await api.post(API_ROUTES.ATTENDANCES.RESUME);
        return response.data.data;
    },

    async end(): Promise<AttendanceTimerState> {
        const response = await api.post(API_ROUTES.ATTENDANCES.END);
        return response.data.data;
    },
};
