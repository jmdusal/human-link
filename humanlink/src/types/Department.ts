export interface Department {
    id: number;
    companyId: number;
    name: string;
    slug: string;
    isActive: boolean;
    positionsCount?: number;
    createdAt: string;
    updatedAt?: string;
}

export interface DepartmentFormData {
    name: string;
    slug: string;
    isActive: boolean;
}
