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

    async saveUser(formData: UserFormData, userId?: number): Promise<User> {
        const { scheduleStartDate, weeklyData, ...rest } = formData;
        const payload: any = {
            ...rest,
            startDate: scheduleStartDate,
            weeklyData: weeklyData.map((day: any) => {
                const { startDate, ...cleanDay } = day;
                return cleanDay;
            })
        };

        if (userId && !payload.password) {
            delete payload.password;
        }

        const response = userId
            ? await api.put(API_ROUTES.USERS.UPDATE(userId), payload)
            : await api.post(API_ROUTES.USERS.STORE, payload);

        return response.data.data;
    },

    async deleteUser(id: number): Promise<void> {
        await api.delete(API_ROUTES.USERS.DELETE(id));
    }
};