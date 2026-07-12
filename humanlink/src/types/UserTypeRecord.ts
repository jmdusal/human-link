import type { Permission } from '@/types/Permission';

export type AccessScope = 'self' | 'workspace' | 'company';

export interface UserTypeRecord {
    id: number;
    companyId: number;
    name: string;
    slug: string;
    accessScope: AccessScope;
    isSystem: boolean;
    usersCount?: number;
    permissions?: Permission[];
    createdAt: string;
    updatedAt?: string;
}

export interface UserTypeFormData {
    name: string;
    accessScope: AccessScope;
    permissions: string[];
}
