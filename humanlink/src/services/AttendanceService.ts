import api from '@/api/axios';
import { API_ROUTES } from '@/constants';
import type { Attendance, AttendanceLocationPayload, AttendanceTimerState } from '@/types';

export const AttendanceService = {
    async list(params?: { start?: string; end?: string }): Promise<Attendance[]> {
        const response = await api.get(API_ROUTES.ATTENDANCES.LIST, { params });
        return response.data.data;
    },

    async status(): Promise<AttendanceTimerState> {
        const response = await api.get(API_ROUTES.ATTENDANCES.STATUS);
        return response.data.data;
    },

    async start(location?: AttendanceLocationPayload): Promise<AttendanceTimerState> {
        const response = await api.post(API_ROUTES.ATTENDANCES.START, location ?? {});
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

    async end(location?: AttendanceLocationPayload): Promise<AttendanceTimerState> {
        const response = await api.post(API_ROUTES.ATTENDANCES.END, location ?? {});
        return response.data.data;
    },
};
