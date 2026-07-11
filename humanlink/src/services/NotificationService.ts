import api from '@/api/axios';
import { API_ROUTES } from '@/constants';

export interface AppNotification {
    id: string;
    title: string;
    message?: string | null;
    time?: string;
    read: boolean;
    type?: string | null;
    companyId?: number | null;
    leaveRequestId?: number | null;
    payslipId?: number | null;
    workspaceId?: number | null;
    workspaceSlug?: string | null;
    invitationToken?: string | null;
    taskId?: number | null;
    projectId?: number | null;
    createdAt?: string;
}

export const NotificationService = {
    async list(): Promise<AppNotification[]> {
        const response = await api.get(API_ROUTES.NOTIFICATIONS.LIST);
        return response.data.data.map((item: any) => ({
            ...item,
            companyId: item.companyId ?? item.company_id ?? null,
            leaveRequestId: item.leaveRequestId ?? item.leave_request_id ?? null,
            payslipId: item.payslipId ?? item.payslip_id ?? null,
            workspaceId: item.workspaceId ?? item.workspace_id ?? null,
            workspaceSlug: item.workspaceSlug ?? item.workspace_slug ?? null,
            invitationToken: item.invitationToken ?? item.invitation_token ?? null,
            taskId: item.taskId ?? item.task_id ?? null,
            projectId: item.projectId ?? item.project_id ?? null,
        }));
    },

    async markAsRead(id: string): Promise<void> {
        await api.post(API_ROUTES.NOTIFICATIONS.READ(id));
    },

    async markAllAsRead(): Promise<void> {
        await api.post(API_ROUTES.NOTIFICATIONS.READ_ALL);
    },
};
