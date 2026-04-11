import api from '@/api/axios';
import { API_ROUTES } from '@/constants';
import type { Workspace, WorkspaceFormData } from '@/types';

export const WorkspaceService = {
    
    async getAllWorkspaces(params?: object): Promise<Workspace[]> {
        const response = await api.get(API_ROUTES.WORKSPACES.LIST, { params });
        return response.data.data;
    },
    
    async getWorkspaceBySlug(slug: string): Promise<Workspace> {
        const response = await api.get(API_ROUTES.WORKSPACES.GET_BY_SLUG(slug));
        return response.data.data;
    },
    
    // get statuses by workspace id
    // async getWorkspaceStatuses(workspaceId: number): Promise<any[]> {
    //     const response = await api.get(API_ROUTES.STATUSES.LIST, {
    //         params: { workspaceId }
    //         // params: { workspaceId: workspaceId }
    //     });
        
    //     return response.data.data;
    // },
    
    async saveWorkspace(formData: WorkspaceFormData, workspaceId?: number): Promise<Workspace> {
        const response = workspaceId
            ? await api.put(API_ROUTES.WORKSPACES.UPDATE(workspaceId), formData)
            : await api.post(API_ROUTES.WORKSPACES.STORE, formData);

        return response.data.data;
    },
    
    async deleteWorkspace(id: number): Promise<void> {
        await api.delete(API_ROUTES.WORKSPACES.DELETE(id));
    }
}
