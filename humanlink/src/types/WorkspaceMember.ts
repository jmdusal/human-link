import type { User } from '@/types/User';

export interface WorkspaceMember extends User {
    pivot: {
        role: 'owner' | 'admin' | 'member';
        workspaceId: number;
        userId: number;
    };
}