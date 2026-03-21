import type { Role } from '@/types/models/Role';
import type { UserRate } from '@/types/models/UserRate';
import type { Schedule } from '@/types/models/Schedule';

export interface User {
    id: number;
    name: string;
    email: string;
    status: 'active' | 'inactive';
    timerStatus: 'working' | 'paused' | 'offline';
    color?: string;
    roles: Role[];
    rate?: UserRate;
    schedule?: Schedule;
    createdAt: string;
}