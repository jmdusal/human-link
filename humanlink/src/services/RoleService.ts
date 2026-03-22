import api from '@/api/axios';
import { API_ROUTES } from '@/constants';
import type { Role, RoleFormData } from '@/types/models';

export const RoleService = {
    
    async getAllRoles(params?: object): Promise<Role[]> {
        const response = await api.get(API_ROUTES.ROLES.LIST, { params });
        return response.data.data;
    },
    
    // async getPermissionOptions() {
    //     const res = await api.get(API_ROUTES.PERMISSIONS.LIST);
    //     return res.data.data;
    // },
    
    async saveRole(formData: RoleFormData, roleId?: number): Promise<Role> {
        
        const response = roleId
            ? await api.put(API_ROUTES.ROLES.UPDATE(roleId), formData)
            : await api.post(API_ROUTES.ROLES.STORE, formData);

        return response.data.data;
    },
    
    async deleteRole(id: number): Promise<void> {
        await api.delete(API_ROUTES.ROLES.DELETE(id));
    }
}