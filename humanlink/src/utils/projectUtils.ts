import type { Project, ProjectFormData } from '@/types';

export const INITIAL_PROJECT_FORM_STATE = (workspaceId: number): ProjectFormData => ({
    workspaceId: workspaceId,
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'active',
    projectMembers: [],
});

export const formatProjectFormData = (project: Project): ProjectFormData => ({
    workspaceId: project.workspaceId,
    name: project.name,
    description: project.description ?? '',
    startDate: project.startDate ?? '',
    endDate: project.endDate ?? '',
    status: project.status,
    projectMembers: project.projectMembers || [],
});