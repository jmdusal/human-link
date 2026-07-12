import api from '@/api/axios';
import { API_ROUTES } from '@/constants';
import type { UserTypeFormData, UserTypeRecord } from '@/types/UserTypeRecord';

export const UserTypeService = {
    async getAllUserTypes(params?: object): Promise<UserTypeRecord[]> {
        const response = await api.get(API_ROUTES.USER_TYPES.LIST, { params });
        return response.data.data;
    },

    async saveUserType(formData: UserTypeFormData, userTypeId?: number): Promise<UserTypeRecord> {
        const response = userTypeId
            ? await api.put(API_ROUTES.USER_TYPES.UPDATE(userTypeId), formData)
            : await api.post(API_ROUTES.USER_TYPES.STORE, formData);

        return response.data.data;
    },

    async deleteUserType(id: number): Promise<void> {
        await api.delete(API_ROUTES.USER_TYPES.DELETE(id));
    },
};
