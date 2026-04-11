import type { User } from '@/types/User';
import type { Project } from '@/types/Project';
import type { Status } from '@/types/Status';
import type { WorkspaceMember } from '@/types/WorkspaceMember';

export interface Workspace {
    id: number;
    name: string;
    slug: string;
    ownerId: number;
    owner?: Partial<User>;
    members?: WorkspaceMember[];
    statuses?: Status[];
    projects?: Project[];
    createdAt: string;
}

export interface WorkspaceFormData {
    name: string;
    slug: string;
    members: User[] | WorkspaceMember[];
}