export interface ActivityLog {
    id: number;
    description: string;
    subjectType: string;
    companyId?: number | null;
    properties: {
        attributes?: Record<string, any>;
        old?: Record<string, any>;
    };
    causer: {
        name: string;
        email: string;
        color?: string;
    } | null;
    createdAt: string;
}