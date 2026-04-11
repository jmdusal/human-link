import api from '@/api/axios';
import { API_ROUTES } from '@/constants';
import type { Task, TaskFormData, TaskPositionUpdate } from '@/types';

export const TaskService = {
    
    async saveTask(formData: TaskFormData, taskId?: number): Promise<Task> {
        const response = taskId
            ? await api.put(API_ROUTES.TASKS.UPDATE(taskId), formData)
            : await api.post(API_ROUTES.TASKS.STORE, formData);

        return response.data.data;
    },
    
    async updateTaskPosition(taskId: number | string, data: TaskPositionUpdate): Promise<any> {
        const response = await api.patch(API_ROUTES.TASKS.UPDATE_POSITION(taskId), data);
        return response.data.data;
    },
    
    async deleteTask(id: number): Promise<void> {
        await api.delete(API_ROUTES.TASKS.DELETE(id));
    }

}