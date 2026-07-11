import api from '@/api/axios';
import { API_ROUTES } from '@/constants';
import type { UserDocument, UserDocumentType } from '@/types';

export const UserDocumentService = {
    async list(userId: number): Promise<UserDocument[]> {
        const response = await api.get(API_ROUTES.USERS.DOCUMENTS(userId));
        return response.data.data;
    },

    async upload(userId: number, type: UserDocumentType, file: File): Promise<UserDocument> {
        const formData = new FormData();
        formData.append('type', type);
        formData.append('file', file);

        const response = await api.post(API_ROUTES.USERS.DOCUMENTS(userId), formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        return response.data.data;
    },

    async generateContract(userId: number, templateId?: number): Promise<UserDocument> {
        const response = await api.post(API_ROUTES.USERS.GENERATE_CONTRACT(userId), {
            templateId: templateId ?? null,
        });

        return response.data.data;
    },

    async delete(userId: number, documentId: number): Promise<void> {
        await api.delete(API_ROUTES.USERS.DOCUMENT_DELETE(userId, documentId));
    },
};
