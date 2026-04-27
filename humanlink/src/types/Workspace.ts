// import type { User } from '@/types/User';
// import type { Project } from '@/types/Project';
// import type { Status } from '@/types/Status';
// import type { WorkspaceMember } from '@/types/WorkspaceMember';
// import type { Tag } from '@/types/Tag';

import type {
    User,
    Project,
    Status,
    Tag,
    WorkspaceMember
 } from '@/types';

export interface Workspace {
    id: number;
    name: string;
    slug: string;
    ownerId: number;
    owner?: Partial<User>;
    members?: WorkspaceMember[];
    statuses?: Status[];
    tags?: Tag[];
    projects?: Project[];
    createdAt: string;
}

export interface WorkspaceFormData {
    name: string;
    slug: string;
    members: User[] | WorkspaceMember[];
}