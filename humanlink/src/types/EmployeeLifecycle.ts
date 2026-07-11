export type LifecycleType = 'onboard' | 'offboard';
export type LifecycleStatus = 'in_progress' | 'completed';

export interface EmployeeChecklistItem {
    id: number;
    employeeChecklistId: number;
    key: string;
    label: string;
    isDone: boolean;
    doneAt?: string | null;
    doneBy?: number | null;
    sortOrder: number;
}

export interface EmployeeChecklist {
    id: number;
    userId: number;
    type: LifecycleType;
    status: LifecycleStatus;
    completedAt?: string | null;
    completedBy?: number | null;
    notes?: string | null;
    items: EmployeeChecklistItem[];
}

export interface EmployeeLifecyclePayload {
    onboard: EmployeeChecklist | null;
    offboard: EmployeeChecklist | null;
    documents?: import('@/types/UserDocument').UserDocument[];
    softDocumentKeys?: string[];
}

export interface OffboardPayload {
    terminatedAt: string;
    generateFinalPayslip?: boolean;
    includeLeavePayout?: boolean;
    notes?: string;
}
