import api from '@/api/axios';
import { API_ROUTES } from '@/constants';
import type { ContractTemplate, ContractTemplateFormData } from '@/types';

const createPdfObjectUrl = (data: BlobPart): string => {
    const blob = new Blob([data], { type: 'application/pdf' });
    return window.URL.createObjectURL(blob);
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

    async preview(id: number): Promise<string> {
        const response = await api.get(API_ROUTES.CONTRACT_TEMPLATES.PREVIEW(id), {
            responseType: 'blob',
        });
        return createPdfObjectUrl(response.data);
    },

    async previewDraft(body: string): Promise<string> {
        const response = await api.post(
            API_ROUTES.CONTRACT_TEMPLATES.PREVIEW_DRAFT,
            { body },
            { responseType: 'blob' }
        );
        return createPdfObjectUrl(response.data);
    },
};
