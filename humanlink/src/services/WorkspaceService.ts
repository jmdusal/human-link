import api from '@/api/axios';
import { API_ROUTES } from '@/constants';
import type { Workspace, WorkspaceFormData } from '@/types';

export type WorkspaceActivityItem = {
    id: string;
    type: string;
    user?: { id: number; name: string; email?: string } | null;
    taskId?: number;
    taskTitle?: string;
    projectId?: number;
    description: string;
    createdAt?: string;
    time?: string;
};

export const WorkspaceService = {
    async getAllWorkspaces(params?: object): Promise<Workspace[]> {
        const response = await api.get(API_ROUTES.WORKSPACES.LIST, { params });
        return response.data.data;
    },

    async getWorkspaceBySlug(slug: string): Promise<Workspace> {
        const response = await api.get(API_ROUTES.WORKSPACES.GET_BY_SLUG(slug));
        return response.data.data;
    },

    async saveWorkspace(formData: WorkspaceFormData | Partial<WorkspaceFormData>, workspaceId?: number): Promise<Workspace> {
        const response = workspaceId
            ? await api.put(API_ROUTES.WORKSPACES.UPDATE(workspaceId), formData)
            : await api.post(API_ROUTES.WORKSPACES.STORE, formData);

        return response.data.data;
    },

    async deleteWorkspace(id: number): Promise<void> {
        await api.delete(API_ROUTES.WORKSPACES.DELETE(id));
    },

    async archiveWorkspace(id: number): Promise<Workspace> {
        const response = await api.post(API_ROUTES.WORKSPACES.ARCHIVE(id));
        return response.data.data;
    },

    async restoreWorkspace(id: number): Promise<Workspace> {
        const response = await api.post(API_ROUTES.WORKSPACES.RESTORE(id));
        return response.data.data;
    },

    async getActivity(workspaceId: number): Promise<WorkspaceActivityItem[]> {
        const response = await api.get(API_ROUTES.WORKSPACES.ACTIVITY(workspaceId));
        return response.data.data;
    },

    async inviteMember(workspaceId: number, userId: number, role: 'admin' | 'member' = 'member'): Promise<Workspace> {
        const response = await api.post(API_ROUTES.WORKSPACES.INVITE_MEMBER(workspaceId), {
            userId,
            role,
        });
        return response.data.data;
    },

    async removeMember(workspaceId: number, userId: number): Promise<Workspace> {
        const response = await api.delete(API_ROUTES.WORKSPACES.REMOVE_MEMBER(workspaceId, userId));
        return response.data.data;
    },

    async changeMemberRole(workspaceId: number, userId: number, role: 'admin' | 'member'): Promise<Workspace> {
        const response = await api.patch(API_ROUTES.WORKSPACES.CHANGE_MEMBER_ROLE(workspaceId, userId), {
            role,
        });
        return response.data.data;
    },

    async acceptInvitation(token: string): Promise<Workspace> {
        const response = await api.post(API_ROUTES.WORKSPACES.ACCEPT_INVITATION(token));
        return response.data.data;
    },

    async declineInvitation(token: string): Promise<void> {
        await api.post(API_ROUTES.WORKSPACES.DECLINE_INVITATION(token));
    },

    async resendInvitation(workspaceId: number, userId: number): Promise<Workspace> {
        const response = await api.post(API_ROUTES.WORKSPACES.RESEND_INVITATION(workspaceId, userId));
        return response.data.data;
    },

    async cancelInvitation(workspaceId: number, userId: number): Promise<Workspace> {
        const response = await api.delete(API_ROUTES.WORKSPACES.CANCEL_INVITATION(workspaceId, userId));
        return response.data.data;
    },

    async leaveWorkspace(id: number): Promise<void> {
        await api.post(API_ROUTES.WORKSPACES.LEAVE(id));
    },

    async transferOwnership(workspaceId: number, userId: number): Promise<Workspace> {
        const response = await api.post(API_ROUTES.WORKSPACES.TRANSFER_OWNERSHIP(workspaceId), {
            userId,
        });
        return response.data.data;
    },
};
