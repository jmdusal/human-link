import type { User } from '@/types/User';
import type { TaskAssignment } from '@/types/TaskAssignment';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
    id: number;
    projectId: number;
    statusId: number;
    parentId: number | null;
    creatorId: number;
    title: string;
    description: string | null;
    priority: TaskPriority;
    position: number;
    dueDate: string | null;
    estimateMinutes: number | null;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
    projectName?: string;
    assignees?: TaskAssignment[];
}

export interface TaskFormData {
    projectId: number;
    statusId: number;
    title: string;
    description?: string;
    priority: TaskPriority;
    position?: number;
    dueDate: string;
    estimateMinutes?: number;
    parentId?: number | null;
    assignees: User[] | TaskAssignment[];
}

export interface TaskPositionUpdate {
    statusId: number;
    // position: number;
}