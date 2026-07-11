import api from '@/api/axios';
import { API_ROUTES } from '@/constants';
import type { Company, CompanyFormData } from '@/types';

export const CompanyService = {
    async list(): Promise<Company[]> {
        const response = await api.get(API_ROUTES.COMPANIES.LIST);
        return response.data.data;
    },

    async current(): Promise<Company> {
        const response = await api.get(API_ROUTES.COMPANIES.CURRENT);
        return response.data.data;
    },

    async show(id: number): Promise<Company> {
        const response = await api.get(API_ROUTES.COMPANIES.SHOW(id));
        return response.data.data;
    },

    async create(formData: CompanyFormData): Promise<Company> {
        const response = await api.post(API_ROUTES.COMPANIES.STORE, formData);
        return response.data.data;
    },

    async updateCurrent(formData: Partial<CompanyFormData>): Promise<Company> {
        const response = await api.put(API_ROUTES.COMPANIES.UPDATE_CURRENT, formData);
        return response.data.data;
    },

    async update(id: number, formData: Partial<CompanyFormData>): Promise<Company> {
        const response = await api.put(API_ROUTES.COMPANIES.UPDATE(id), formData);
        return response.data.data;
    },

    async switch(companyId: number): Promise<Company> {
        const response = await api.post(API_ROUTES.COMPANIES.SWITCH, { company_id: companyId });
        return response.data.data;
    },
};
