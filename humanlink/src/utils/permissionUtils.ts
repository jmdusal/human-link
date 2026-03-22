import type { Permission, PermissionFormData } from '@/types/models';

export const INITIAL_PERMISSION_FORM_STATE: PermissionFormData = {
    name: '',
};

export const formatPermissionFormData = (permission: Permission): PermissionFormData => {
    return {
        name: permission.name || '',
    };
};