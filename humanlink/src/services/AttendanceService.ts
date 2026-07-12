import api from '@/api/axios';
import { API_ROUTES } from '@/constants';
import type { Attendance, AttendanceTimerState } from '@/types';
import type { GeoPosition } from '@/utils/geolocation';

export const AttendanceService = {
    async list(params?: { start?: string; end?: string }): Promise<Attendance[]> {
        const response = await api.get(API_ROUTES.ATTENDANCES.LIST, { params });
        return response.data.data;
    },

    async status(): Promise<AttendanceTimerState> {
        const response = await api.get(API_ROUTES.ATTENDANCES.STATUS);
        return response.data.data;
    },

    async start(location?: GeoPosition | null): Promise<AttendanceTimerState> {
        const response = await api.post(API_ROUTES.ATTENDANCES.START, location ?? undefined);
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

    async end(location?: GeoPosition | null): Promise<AttendanceTimerState> {
        const response = await api.post(API_ROUTES.ATTENDANCES.END, location ?? undefined);
        return response.data.data;
    },

    async continue(): Promise<AttendanceTimerState> {
        const response = await api.post(API_ROUTES.ATTENDANCES.CONTINUE);
        return response.data.data;
    },
};
