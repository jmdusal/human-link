import type { User } from '@/types/User';

export interface ProjectMember extends User {
    pivot: {
        role: 'admin' | 'member' | 'viewer';
        projectId: number;
        userId: number;
    };
}
