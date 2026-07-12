export interface ActivityLogChange {
    field: string;
    old: string | null;
    new: string | null;
}

export interface ActivityLog {
    id: number;
    event: 'created' | 'updated' | 'deleted' | string;
    description: string;
    summary: string;
    subjectType: string;
    resource: string;
    subjectLabel?: string | null;
    companyId?: number | null;
    company?: {
        id: number;
        name: string;
        slug?: string;
    } | null;
    changes: ActivityLogChange[];
    properties: {
        attributes?: Record<string, unknown>;
        old?: Record<string, unknown>;
    };
    causer: {
        name: string;
        email: string;
        color?: string;
    } | null;
    time?: string;
    createdAt: string;
}
