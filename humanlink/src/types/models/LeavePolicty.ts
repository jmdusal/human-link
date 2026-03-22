export interface LeavePolicy {
    id: number;
    name: string;
    slug: string;
    defaultCredits: string;
    isActive: number;
    isPaid: number;
    createdAt: string;
}

export interface LeavePolicyFormData {
    name: string;
    slug: string;
    defaultCredits: string;
    isActive: boolean;
    isPaid: boolean;
}