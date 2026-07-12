export interface Position {
    id: number;
    companyId: number;
    departmentId: number;
    name: string;
    slug: string;
    isActive: boolean;
    department?: {
        id: number;
        name: string;
        slug?: string;
    } | null;
    createdAt: string;
    updatedAt?: string;
}

export interface PositionFormData {
    departmentId: string;
    name: string;
    slug: string;
    isActive: boolean;
}
