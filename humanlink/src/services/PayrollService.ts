import api from '@/api/axios';
import { API_ROUTES } from '@/constants';
import type {
    GenerateIndividualPayrollPayload,
    GeneratePayrollPayload,
    PayrollMeta,
    Payslip,
} from '@/types';

export const PayrollService = {
    async list(year: number, month: number): Promise<{ data: Payslip[]; meta: PayrollMeta }> {
        const response = await api.get(API_ROUTES.PAYROLLS.LIST, {
            params: { year, month },
        });

        return {
            data: response.data.data,
            meta: response.data.meta,
        };
    },

    async show(id: number): Promise<Payslip> {
        const response = await api.get(API_ROUTES.PAYROLLS.SHOW(id));
        return response.data.data;
    },

    async generate(payload: GeneratePayrollPayload): Promise<{ data: Payslip[]; meta: PayrollMeta; message: string }> {
        const response = await api.post(API_ROUTES.PAYROLLS.GENERATE, payload);
        return {
            data: response.data.data,
            meta: response.data.meta,
            message: response.data.message,
        };
    },

    async generateIndividual(payload: GenerateIndividualPayrollPayload): Promise<Payslip> {
        const response = await api.post(API_ROUTES.PAYROLLS.GENERATE_INDIVIDUAL, payload);
        return response.data.data;
    },

    async generateThirteenthMonth(year: number): Promise<{ data: Payslip[]; meta: PayrollMeta; message: string }> {
        const response = await api.post(API_ROUTES.PAYROLLS.GENERATE_13TH_MONTH, { year });
        return {
            data: response.data.data,
            meta: response.data.meta,
            message: response.data.message,
        };
    },

    async downloadPdf(id: number): Promise<void> {
        const response = await api.get(API_ROUTES.PAYROLLS.PDF(id), {
            responseType: 'blob',
        });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `payslip-${id}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    },

    async delete(id: number): Promise<void> {
        await api.delete(API_ROUTES.PAYROLLS.DELETE(id));
    },
};
