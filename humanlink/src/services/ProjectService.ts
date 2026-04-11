import api from '@/api/axios';
import { API_ROUTES } from '@/constants';
import type { Project, ProjectFormData } from '@/types';

export const ProjectService = {
    
    async getAllProjects(params?: object): Promise<Project[]> {
        const response = await api.get(API_ROUTES.PROJECTS.LIST, { params });
        return response.data.data;
    },
    
    async saveProject(formData: ProjectFormData, projectId?: number): Promise<Project> {
        const response = projectId
            ? await api.put(API_ROUTES.PROJECTS.UPDATE(projectId), formData)
            : await api.post(API_ROUTES.PROJECTS.STORE, formData);

        return response.data.data;
    },
    
    async deleteProject(id: number): Promise<void> {
        await api.delete(API_ROUTES.PROJECTS.DELETE(id));
    }
}
