import api from '@/api/axios';
import { API_ROUTES } from '@/constants';
import type { Department, DepartmentFormData } from '@/types';

export const DepartmentService = {
    async getAllDepartments(params?: object): Promise<Department[]> {
        const response = await api.get(API_ROUTES.DEPARTMENTS.LIST, { params });
        return response.data.data;
    },

    async saveDepartment(formData: DepartmentFormData, departmentId?: number): Promise<Department> {
        const response = departmentId
            ? await api.put(API_ROUTES.DEPARTMENTS.UPDATE(departmentId), formData)
            : await api.post(API_ROUTES.DEPARTMENTS.STORE, formData);

        return response.data.data;
    },

    async deleteDepartment(id: number): Promise<void> {
        await api.delete(API_ROUTES.DEPARTMENTS.DELETE(id));
    },
};
