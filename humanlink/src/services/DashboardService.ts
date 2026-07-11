import api from '@/api/axios';
import { API_ROUTES } from '@/constants';
import type { DashboardSummary } from '@/types/Dashboard';

export const DashboardService = {
    async summary(): Promise<DashboardSummary> {
        const response = await api.get(API_ROUTES.DASHBOARD.SUMMARY);
        return response.data.data;
    },
};
