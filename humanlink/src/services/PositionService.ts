import api from '@/api/axios';
import { API_ROUTES } from '@/constants';
import type { Position, PositionFormData } from '@/types';

export const PositionService = {
    async getAllPositions(params?: { departmentId?: number | string }): Promise<Position[]> {
        const response = await api.get(API_ROUTES.POSITIONS.LIST, { params });
        return response.data.data;
    },

    async savePosition(formData: PositionFormData, positionId?: number): Promise<Position> {
        const response = positionId
            ? await api.put(API_ROUTES.POSITIONS.UPDATE(positionId), formData)
            : await api.post(API_ROUTES.POSITIONS.STORE, formData);

        return response.data.data;
    },

    async deletePosition(id: number): Promise<void> {
        await api.delete(API_ROUTES.POSITIONS.DELETE(id));
    },
};
