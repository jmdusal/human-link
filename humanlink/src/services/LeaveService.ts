import api from '@/api/axios';
import { API_ROUTES } from '@/constants';

export const LeaveService = {
    getAllLeaveOverview: async () => {
        const response = await api.get(API_ROUTES.LEAVES.LIST);
        return response.data.data;
    }
}