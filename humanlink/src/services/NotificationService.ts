import api from '@/api/axios';
import { API_ROUTES } from '@/constants';

export interface AppNotification {
    id: string;
    title: string;
    message?: string | null;
    time?: string;
    read: boolean;
    type?: string | null;
    leaveRequestId?: number | null;
    payslipId?: number | null;
    createdAt?: string;
}

export const NotificationService = {
    async list(): Promise<AppNotification[]> {
        const response = await api.get(API_ROUTES.NOTIFICATIONS.LIST);
        return response.data.data.map((item: any) => ({
            ...item,
            payslipId: item.payslipId ?? item.payslip_id ?? null,
        }));
    },

    async markAsRead(id: string): Promise<void> {
        await api.post(API_ROUTES.NOTIFICATIONS.READ(id));
    },

    async markAllAsRead(): Promise<void> {
        await api.post(API_ROUTES.NOTIFICATIONS.READ_ALL);
    },
};
