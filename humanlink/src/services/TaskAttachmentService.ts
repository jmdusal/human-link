import api from '@/api/axios';
import { API_ROUTES } from '@/constants';
import type { TaskAttachment } from '@/types';

export const TaskAttachmentService = {
    async list(taskId: number): Promise<TaskAttachment[]> {
        const response = await api.get(API_ROUTES.TASK_ATTACHMENTS.LIST(taskId));
        return response.data.data;
    },

    async upload(taskId: number, file: File): Promise<TaskAttachment> {
        const formData = new FormData();
        formData.append('image', file);

        const response = await api.post(API_ROUTES.TASK_ATTACHMENTS.STORE(taskId), formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        return response.data.data;
    },

    async delete(attachmentId: number): Promise<void> {
        await api.delete(API_ROUTES.TASK_ATTACHMENTS.DELETE(attachmentId));
    },
};
