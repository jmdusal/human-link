import api from '@/api/axios';
import { API_ROUTES } from '@/constants';
import type { LeavePolicy, LeavePolicyFormData } from '@/types';

export const LeavePolicyService = {
    
    async getAllLeavePolicies(params?: object): Promise<LeavePolicy[]> {
        const response = await api.get(API_ROUTES.LEAVE_POLICIES.LIST, { params });
        return response.data.data;
    },
    
    async savePolicy(formData: LeavePolicyFormData, policyId?: number): Promise<LeavePolicy> {
        
        const response = policyId
            ? await api.put(API_ROUTES.LEAVE_POLICIES.UPDATE(policyId), formData)
            : await api.post(API_ROUTES.LEAVE_POLICIES.STORE, formData);

        return response.data.data;
    },
    
    async deletePolicy(id: number): Promise<void> {
        await api.delete(API_ROUTES.LEAVE_POLICIES.DELETE(id));
    }
}
