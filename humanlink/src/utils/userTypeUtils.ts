import type { AccessScope, UserTypeFormData, UserTypeRecord } from '@/types/UserTypeRecord';

export const ACCESS_SCOPE_OPTIONS: { value: AccessScope; label: string; description: string }[] = [
    { value: 'self', label: 'Self only', description: 'Can only access their own records.' },
    { value: 'workspace', label: 'Workspace', description: 'Can access shared workspace members.' },
    { value: 'company', label: 'Company', description: 'Can access everyone in the company.' },
];

export const INITIAL_USER_TYPE_FORM_STATE: UserTypeFormData = {
    name: '',
    accessScope: 'self',
    permissions: [],
};

export const formatUserTypeFormData = (userType: UserTypeRecord): UserTypeFormData => ({
    name: userType.name || '',
    accessScope: userType.accessScope || 'self',
    permissions: userType.permissions?.map((p) => p.name) || [],
});

export const accessScopeLabel = (scope?: AccessScope | null): string => {
    return ACCESS_SCOPE_OPTIONS.find((option) => option.value === scope)?.label || 'Self only';
};
