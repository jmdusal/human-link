export interface TaskComment {
    id: number;
    taskId: number;
    userId: number;
    parentId: number | null;
    content: string;
    createdAt: string;
    user: {
        id: number;
        name: string;
    };
    replies?: TaskComment[];
}