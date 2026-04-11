import type { Workspace, WorkspaceFormData } from '@/types';

export const INITIAL_WORKSPACE_FORM_STATE: WorkspaceFormData = {
    name: '',
    slug: '',
    members: [],
};

export const formatWorkspaceFormData = (workspace: Workspace): WorkspaceFormData => ({
    name: workspace.name || '',
    slug: workspace.slug || '',
    members: workspace.members || [],
});