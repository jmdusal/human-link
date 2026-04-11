export interface LeavePolicy {
    id: number;
    name: string;
    slug: string;
    defaultCredits: string;
    isActive: number;
    isPaid: number;
    isCashable: number;
    allowCarryOver: number;
    maxCarryOver: string;
    requiresAttachment: number;
    createdAt: string;
}

export interface LeavePolicyFormData {
    name: string;
    slug: string;
    defaultCredits: string;
    isActive: boolean;
    isPaid: boolean;
    isCashable: boolean;
    allowCarryOver: boolean;
    maxCarryOver: string;
    requiresAttachment: boolean;
}