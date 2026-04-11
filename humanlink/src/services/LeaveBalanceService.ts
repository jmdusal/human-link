import api from '@/api/axios';
import { API_ROUTES } from '@/constants';
import type { LeaveBalance, LeaveBalanceFormData } from '@/types';

export const LeaveBalanceService = {
    
    async getAllLeaveBalances(params?: object): Promise<LeaveBalance[]> {
        const response = await api.get(API_ROUTES.LEAVE_BALANCES.LIST, { params });
        return response.data.data;
    },
    
    async saveBalance(formData: LeaveBalanceFormData, balanceId?: number): Promise<LeaveBalance> {

        const response = balanceId
            ? await api.put(API_ROUTES.LEAVE_BALANCES.UPDATE(balanceId), formData)
            : await api.post(API_ROUTES.LEAVE_BALANCES.STORE, formData);

        return response.data.data;
    },
    
    async deleteBalance(id: number): Promise<void> {
        await api.delete(API_ROUTES.LEAVE_BALANCES.DELETE(id));
    }
}
