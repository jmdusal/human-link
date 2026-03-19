import type { Permission } from '@/types/models/Permission'

export interface Role {
    id: number;
    name: string;
    createdAt: string;
    permissions?: Permission[];
}