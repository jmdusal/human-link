export interface UserDetail {
    id: number;
    userId: number;
    sssNumber?: string | null;
    philhealthNumber?: string | null;
    pagibigNumber?: string | null;
    tin?: string | null;
    departmentId?: number | null;
    positionId?: number | null;
    jobTitle?: string | null;
    department?: string | null;
    employmentType?: EmploymentType | null;
    mobile?: string | null;
    emergencyContactName?: string | null;
    emergencyContactPhone?: string | null;
    emergencyContactRelationship?: string | null;
}

export type EmploymentType = 'regular' | 'probationary' | 'contractor';
