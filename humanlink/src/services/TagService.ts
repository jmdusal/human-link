import api from '@/api/axios';
import { API_ROUTES } from '@/constants';
import type { Tag, TagFormData } from '@/types';

export const TagService = {
    async getWorkspaceTags(workspaceId: number): Promise<Tag[]> {
        const response = await api.get(API_ROUTES.TAGS.LIST, {
            params: { workspaceId }
        });
        
        return response.data.data;
    },
    
    async saveTag(formData: TagFormData, tagId?: number): Promise<Tag> {
        
        const response = tagId
            ? await api.put(API_ROUTES.TAGS.UPDATE(tagId), formData)
            : await api.post(API_ROUTES.TAGS.STORE, formData);

        return response.data.data;
    },
    
    async deleteTag(id: number): Promise<void> {
        await api.delete(API_ROUTES.TAGS.DELETE(id));
    }
}