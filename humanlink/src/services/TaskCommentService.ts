import api from '@/api/axios';
import { API_ROUTES } from '@/constants';
import type { TaskComment } from '@/types';

export const TaskCommentService = {
    async postTaskComment(
        taskId: number,
        content: string,
        parentId: number | null = null,
        mentionedUserIds: number[] = [],
    ): Promise<TaskComment> {
        const { data } = await api.post(API_ROUTES.TASK_COMMENTS.STORE(taskId), {
            content,
            parent_id: parentId,
            mentioned_user_ids: mentionedUserIds,
        });
        return data;
    },

    async updateTaskComment(commentId: number, content: string): Promise<TaskComment> {
        const { data } = await api.put(API_ROUTES.TASK_COMMENTS.UPDATE(commentId), {
            content,
        });
        return data;
    },

    async deleteTaskComment(commentId: number): Promise<void> {
        await api.delete(API_ROUTES.TASK_COMMENTS.DELETE(commentId));
    },
};
