import type { Role } from '@/types/models/Role';
import type { UserRate } from '@/types/models/UserRate';

export interface User {
    id: number;
    name: string;
    email: string;
    status: 'active' | 'inactive';
    timerStatus: 'working' | 'paused' | 'offline';
    color?: string;
    roles: Role[];
    rate?: UserRate;
    createdAt: string;
}