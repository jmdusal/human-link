import type { Permission } from '@/types/Permission'

export interface Role {
    id: number;
    name: string;
    createdAt: string;
    permissions?: Permission[];
}

export interface RoleFormData {
    name: string;
    permissions: string[];
}