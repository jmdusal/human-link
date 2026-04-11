import type { Role, RoleFormData } from '@/types';

export const INITIAL_ROLE_FORM_STATE: RoleFormData = {
    name: '',
    permissions: [],
};

export const formatRoleFormData = (role: Role): RoleFormData => ({
    name: role.name || '',
    permissions: role.permissions?.map(p => p.name) || [],
});