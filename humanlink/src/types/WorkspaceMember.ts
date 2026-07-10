import type { User } from '@/types/User';

export type WorkspaceMemberStatus = 'pending' | 'accepted';

export interface WorkspaceMember extends User {
    pivot: {
        role: 'owner' | 'admin' | 'member';
        status?: WorkspaceMemberStatus;
        invitationToken?: string | null;
        invitedAt?: string | null;
        acceptedAt?: string | null;
        workspaceId: number;
        userId: number;
    };
}
