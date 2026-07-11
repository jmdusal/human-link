import api from '@/api/axios';
import { API_ROUTES } from '@/constants';
import type {
    EmployeeChecklistItem,
    EmployeeLifecyclePayload,
    OffboardPayload,
} from '@/types/EmployeeLifecycle';
import type { Payslip, User } from '@/types';

export const LifecycleService = {
    async get(userId: number): Promise<EmployeeLifecyclePayload> {
        const response = await api.get(API_ROUTES.USERS.LIFECYCLE(userId));
        return response.data.data;
    },

    async toggleItem(userId: number, itemId: number): Promise<EmployeeChecklistItem> {
        const response = await api.post(API_ROUTES.USERS.LIFECYCLE_TOGGLE(userId, itemId));
        return response.data.data;
    },

    async offboard(userId: number, payload: OffboardPayload): Promise<{
        user: User;
        checklist: EmployeeLifecyclePayload['offboard'];
        payslip?: Payslip | null;
    }> {
        const response = await api.post(API_ROUTES.USERS.OFFBOARD(userId), payload);
        return response.data.data;
    },
};
