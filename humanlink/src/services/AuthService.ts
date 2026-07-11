import api from '@/api/axios';
import { API_ROUTES } from '@/constants';
import type { User } from '@/types';

export type LoginResult =
    | { requiresTwoFactor: true; loginToken: string }
    | { requiresTwoFactor?: false; user: User };

export const AuthService = {
    async login(email: string, password: string): Promise<LoginResult> {
        await api.get('../sanctum/csrf-cookie');
        const response = await api.post(API_ROUTES.AUTH.LOGIN, { email, password });

        if (response.data.requiresTwoFactor) {
            return {
                requiresTwoFactor: true,
                loginToken: response.data.loginToken,
            };
        }

        return { user: response.data.user };
    },

    async completeTwoFactorLogin(loginToken: string, code: string): Promise<User> {
        const response = await api.post(API_ROUTES.AUTH.TWO_FACTOR_LOGIN, {
            loginToken,
            code,
        });
        return response.data.user;
    },

    async forgotPassword(email: string): Promise<string> {
        await api.get('../sanctum/csrf-cookie');
        const response = await api.post(API_ROUTES.AUTH.FORGOT_PASSWORD, { email });
        return response.data.message;
    },

    async resetPassword(payload: {
        token: string;
        email: string;
        password: string;
        passwordConfirmation: string;
    }): Promise<void> {
        await api.get('../sanctum/csrf-cookie');
        await api.post(API_ROUTES.AUTH.RESET_PASSWORD, payload);
    },

    async verifyEmail(id: string, hash: string, query: string): Promise<void> {
        await api.get(`${API_ROUTES.AUTH.VERIFY_EMAIL(id, hash)}?${query}`);
    },

    async sendVerificationEmail(): Promise<void> {
        await api.post(API_ROUTES.AUTH.SEND_VERIFICATION);
    },
};
