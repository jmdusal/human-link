// import { TaskAssignment } from './TaskAssignment';
// import type { User } from '@/types/User';
import type { TaskAssignment } from '@/types/TaskAssignment';
// import type { Tag } from '@/types';
import type { TaskComment, Tag, User } from '@/types';

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
    tags?: Tag[];
    comments?: TaskComment[];
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
    tagIds: number[];
}

export interface TaskPositionUpdate {
    statusId: number;
    // position: number;
}