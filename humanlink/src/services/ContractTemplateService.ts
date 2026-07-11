import api from '@/api/axios';
import { API_ROUTES } from '@/constants';
import type { ContractTemplate, ContractTemplateFormData } from '@/types';

const openPdfBlob = (data: BlobPart) => {
    const blob = new Blob([data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener,noreferrer');
    window.setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
};

export const ContractTemplateService = {
    async getAll(params?: object): Promise<ContractTemplate[]> {
        const response = await api.get(API_ROUTES.CONTRACT_TEMPLATES.LIST, { params });
        return response.data.data;
    },

    async save(formData: ContractTemplateFormData, templateId?: number): Promise<ContractTemplate> {
        const response = templateId
            ? await api.put(API_ROUTES.CONTRACT_TEMPLATES.UPDATE(templateId), formData)
            : await api.post(API_ROUTES.CONTRACT_TEMPLATES.STORE, formData);

        return response.data.data;
    },

    async delete(id: number): Promise<void> {
        await api.delete(API_ROUTES.CONTRACT_TEMPLATES.DELETE(id));
    },

    async preview(id: number): Promise<void> {
        const response = await api.get(API_ROUTES.CONTRACT_TEMPLATES.PREVIEW(id), {
            responseType: 'blob',
        });
        openPdfBlob(response.data);
    },

    async previewDraft(body: string): Promise<void> {
        const response = await api.post(
            API_ROUTES.CONTRACT_TEMPLATES.PREVIEW_DRAFT,
            { body },
            { responseType: 'blob' }
        );
        openPdfBlob(response.data);
    },
};
