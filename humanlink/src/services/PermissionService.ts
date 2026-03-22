import api from '@/api/axios';
import { API_ROUTES } from '@/constants';
import type { Permission, PermissionFormData } from '@/types/models';

export const PermissionService = {
    
    async getAllPermissions(params?: object): Promise<Permission[]> {
        const response = await api.get(API_ROUTES.PERMISSIONS.LIST, { params });
        return response.data.data;
    },
    
    async savePermission(formData: PermissionFormData, permissionId?: number): Promise<Permission> {
        
        const response = permissionId
            ? await api.put(API_ROUTES.PERMISSIONS.UPDATE(permissionId), formData)
            : await api.post(API_ROUTES.PERMISSIONS.STORE, formData);

        return response.data.data;
    },
    
    async deletePermission(id: number): Promise<void> {
        await api.delete(API_ROUTES.PERMISSIONS.DELETE(id));
    }
}