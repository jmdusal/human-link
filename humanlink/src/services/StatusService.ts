import api from '@/api/axios';
import { API_ROUTES } from '@/constants';
import type { Status, StatusFormData } from '@/types';

export const StatusService = {
    // get statuses by workspace id
    async getWorkspaceStatuses(workspaceId: number): Promise<Status[]> {
        const response = await api.get(API_ROUTES.STATUSES.LIST, {
            params: { workspaceId }
            // params: { workspaceId: workspaceId }
        });
        
        return response.data.data;
    },
    
    async saveStatus(formData: StatusFormData, statusId?: number): Promise<Status> {
        
        const response = statusId
            ? await api.put(API_ROUTES.STATUSES.UPDATE(statusId), formData)
            : await api.post(API_ROUTES.STATUSES.STORE, formData);

        return response.data.data;
    },
    
    async reorderStatuses(ids: number[]): Promise<void> {
        await api.post(API_ROUTES.STATUSES.REORDER, { ids });
    },
    
    async deleteStatus(id: number): Promise<void> {
        await api.delete(API_ROUTES.STATUSES.DELETE(id));
    }
}
