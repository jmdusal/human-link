import api from '@/api/axios';
import { API_ROUTES } from '@/constants';
import type { IdCardTemplate, IdCardTemplateFormData } from '@/types';

const createImageObjectUrl = (data: BlobPart): string => {
    const blob = new Blob([data], { type: 'image/png' });
    return window.URL.createObjectURL(blob);
};

export const IdCardTemplateService = {
    async getAll(params?: object): Promise<IdCardTemplate[]> {
        const response = await api.get(API_ROUTES.ID_CARD_TEMPLATES.LIST, { params });
        return response.data.data;
    },

    async save(formData: IdCardTemplateFormData, templateId?: number): Promise<IdCardTemplate> {
        const response = templateId
            ? await api.put(API_ROUTES.ID_CARD_TEMPLATES.UPDATE(templateId), formData)
            : await api.post(API_ROUTES.ID_CARD_TEMPLATES.STORE, formData);

        return response.data.data;
    },

    async delete(id: number): Promise<void> {
        await api.delete(API_ROUTES.ID_CARD_TEMPLATES.DELETE(id));
    },

    async preview(id: number): Promise<string> {
        const response = await api.get(API_ROUTES.ID_CARD_TEMPLATES.PREVIEW(id), {
            responseType: 'blob',
        });
        return createImageObjectUrl(response.data);
    },

    async previewDraft(body: string): Promise<string> {
        const response = await api.post(
            API_ROUTES.ID_CARD_TEMPLATES.PREVIEW_DRAFT,
            { body },
            { responseType: 'blob' }
        );
        return createImageObjectUrl(response.data);
    },
};
