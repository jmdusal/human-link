import type { Permission, PermissionFormData } from '@/types';

export const INITIAL_PERMISSION_FORM_STATE: PermissionFormData = {
    name: '',
};

export const formatPermissionFormData = (permission: Permission): PermissionFormData => ({
    name: permission.name || '',
});