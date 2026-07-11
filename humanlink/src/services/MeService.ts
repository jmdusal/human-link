import api from '@/api/axios';
import { API_ROUTES } from '@/constants';
import type { User } from '@/types';

export interface UpdateMePayload {
    name?: string;
    email?: string;
    password?: string;
}

export const MeService = {
    async show(): Promise<User> {
        const response = await api.get(API_ROUTES.ME.SHOW);
        return response.data.data;
    },

    async update(payload: UpdateMePayload): Promise<User> {
        const response = await api.put(API_ROUTES.ME.UPDATE, payload);
        return response.data.data;
    },
};
