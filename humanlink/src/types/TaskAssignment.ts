import type { User } from '@/types/User';

export interface TaskAssignment extends User {
    pivot: {
        taskId: number;
        userId: number;
    };
}