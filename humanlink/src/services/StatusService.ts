import api from '@/api/axios';
import { API_ROUTES } from '@/constants';
import type { Status } from '@/types';

export const StatusService = {
    
    // get statuses by workspace id
    async getWorkspaceStatuses(workspaceId: number): Promise<Status[]> {
        const response = await api.get(API_ROUTES.STATUSES.LIST, {
            params: { workspaceId }
            // params: { workspaceId: workspaceId }
        });
        
        return response.data.data;
    },

}
