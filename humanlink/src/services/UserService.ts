import api from '@/api/axios';
import { API_ROUTES } from '@/constants';
import type { User, UserFormData } from '@/types';

export const UserService = {
    
    async getAllUsers(params?: object): Promise<User[]> {
        const response = await api.get(API_ROUTES.USERS.LIST, { params });
        return response.data.data;
    },
    
    async getUsersByWorkspace(workspaceId: number): Promise<User[]> {
        const response = await api.get(API_ROUTES.USERS.WORKSPACE_USERS(workspaceId));
        return response.data.data;
    },
    
    async getUsersByProject(projectId: number): Promise<User[]> {
        const response = await api.get(API_ROUTES.USERS.PROJECT_USERS(projectId));
        return response.data.data;
    },

    async getRoleOptions() {
        const res = await api.get(API_ROUTES.ROLES.LIST);
        return res.data.data.map((role: any) => ({
            value: role.name,
            label: role.name.charAt(0).toUpperCase() + role.name.slice(1)
        }));
    },

    async getManagers(): Promise<User[]> {
        const response = await api.get(API_ROUTES.USERS.MANAGERS);
        return response.data.data;
    },

    async saveUser(formData: UserFormData, userId?: number): Promise<User> {
        const normalizeTime = (time: unknown) => {
            if (typeof time !== 'string' || !time) return '08:00';
            return time.slice(0, 5);
        };

        const { scheduleStartDate, weeklyData, userType, ...rest } = formData;
        const payload: any = {
            ...rest,
            userType: userType || null,
            startDate: scheduleStartDate,
            weeklyData: weeklyData.map((day: any) => ({
                dayOfWeek: Number(day.dayOfWeek),
                shiftStart: normalizeTime(day.shiftStart),
                shiftEnd: normalizeTime(day.shiftEnd),
                isRestDay: Boolean(day.isRestDay),
                isNightShift: Boolean(day.isNightShift),
            })),
        };

        if (userId && !payload.password) {
            delete payload.password;
        }

        const response = userId
            ? await api.put(API_ROUTES.USERS.UPDATE(userId), payload)
            : await api.post(API_ROUTES.USERS.STORE, payload);

        return response.data.data;
    },

    async updateUserSchedule(
        userId: number,
        data: { startDate: string; weeklyData: Array<Record<string, unknown>> }
    ): Promise<User> {
        const normalizeTime = (time: unknown) => {
            if (typeof time !== 'string' || !time) return '08:00';
            return time.slice(0, 5);
        };

        const response = await api.put(API_ROUTES.USERS.UPDATE(userId), {
            startDate: data.startDate,
            weeklyData: data.weeklyData.map((day: any) => ({
                dayOfWeek: Number(day.dayOfWeek),
                shiftStart: normalizeTime(day.shiftStart),
                shiftEnd: normalizeTime(day.shiftEnd),
                isRestDay: Boolean(day.isRestDay),
                isNightShift: Boolean(day.isNightShift),
            })),
        });

        return response.data.data;
    },

    async deleteUser(id: number): Promise<void> {
        await api.delete(API_ROUTES.USERS.DELETE(id));
    }
};