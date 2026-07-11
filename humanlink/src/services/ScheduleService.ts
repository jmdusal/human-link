import api from '@/api/axios';
import { API_ROUTES } from '@/constants';
import type { Schedule, WeeklyScheduleDay } from '@/types';

export interface ScheduleFormPayload {
    userId?: number;
    startDate: string;
    endDate?: string | null;
    breakMinutes?: number;
    weeklyData: WeeklyScheduleDay[];
}

function normalizeWeeklyData(weeklyData: WeeklyScheduleDay[]) {
    return weeklyData.map((day) => ({
        dayOfWeek: Number(day.dayOfWeek),
        shiftStart: String(day.shiftStart || '08:00').slice(0, 5),
        shiftEnd: String(day.shiftEnd || '17:00').slice(0, 5),
        isRestDay: Boolean(day.isRestDay),
        isNightShift: Boolean(day.isNightShift),
    }));
}

export const ScheduleService = {
    async list(start: string, end: string): Promise<Schedule[]> {
        const response = await api.get(API_ROUTES.SCHEDULES.LIST, {
            params: { start, end },
        });
        return response.data.data;
    },

    async create(payload: ScheduleFormPayload): Promise<Schedule> {
        const response = await api.post(API_ROUTES.SCHEDULES.STORE, {
            userId: payload.userId,
            startDate: payload.startDate,
            endDate: payload.endDate ?? null,
            breakMinutes: payload.breakMinutes ?? 60,
            weeklyData: normalizeWeeklyData(payload.weeklyData),
        });
        return response.data.data;
    },

    async update(id: number, payload: ScheduleFormPayload): Promise<Schedule> {
        const response = await api.put(API_ROUTES.SCHEDULES.UPDATE(id), {
            startDate: payload.startDate,
            endDate: payload.endDate ?? null,
            breakMinutes: payload.breakMinutes ?? 60,
            weeklyData: normalizeWeeklyData(payload.weeklyData),
        });
        return response.data.data;
    },

    async delete(id: number): Promise<void> {
        await api.delete(API_ROUTES.SCHEDULES.DELETE(id));
    },
};
