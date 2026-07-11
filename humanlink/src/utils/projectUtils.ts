import type { Project, ProjectFormData } from '@/types';

export const INITIAL_PROJECT_FORM_STATE = (workspaceId: number): ProjectFormData => ({
    workspaceId: workspaceId,
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'active',
    projectMembers: [],
    template: null,
});

export const formatProjectFormData = (project: Project): ProjectFormData => ({
    workspaceId: project.workspaceId,
    name: project.name,
    description: project.description ?? '',
    startDate: project.startDate ?? '',
    endDate: project.endDate ?? '',
    status: project.status,
    projectMembers: project.projectMembers || [],
    template: null,
});

export const PROJECT_TEMPLATES = [
    {
        key: 'sprint' as const,
        label: 'Sprint board',
        description: 'Backlog → In Progress → Review → Done',
    },
    {
        key: 'hr_ops' as const,
        label: 'HR ops',
        description: 'Open → In Review → Approved → Closed',
    },
    {
        key: 'client_delivery' as const,
        label: 'Client delivery',
        description: 'Intake → In Progress → Client Review → Delivered',
    },
];
