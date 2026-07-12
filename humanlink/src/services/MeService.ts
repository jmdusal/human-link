import api from '@/api/axios';
import { API_ROUTES } from '@/constants';
import type { User, UserDocument } from '@/types';

export interface UpdateMePayload {
    name?: string;
    email?: string;
    password?: string;
}

export interface TwoFactorSetup {
    method: 'email';
    email: string;
    expiresIn: number;
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

    async generateContract(): Promise<UserDocument> {
        const response = await api.post(API_ROUTES.ME.GENERATE_CONTRACT);
        return response.data.data;
    },

    async generateIdCard(): Promise<UserDocument> {
        const response = await api.post(API_ROUTES.ME.GENERATE_ID);
        return response.data.data;
    },

    async enableTwoFactor(): Promise<TwoFactorSetup> {
        const response = await api.post(API_ROUTES.AUTH.TWO_FACTOR_ENABLE);
        return response.data.data;
    },

    async confirmTwoFactor(code: string): Promise<User> {
        const response = await api.post(API_ROUTES.AUTH.TWO_FACTOR_CONFIRM, { code });
        return response.data.data;
    },

    async disableTwoFactor(password: string): Promise<User> {
        const response = await api.delete(API_ROUTES.AUTH.TWO_FACTOR_DISABLE, {
            data: { password },
        });
        return response.data.data;
    },
};
