import type { Department, DepartmentFormData } from '@/types';

export const INITIAL_DEPARTMENT_FORM_STATE: DepartmentFormData = {
    name: '',
    slug: '',
    isActive: true,
};

export const formatDepartmentFormData = (department: Department): DepartmentFormData => ({
    name: department.name || '',
    slug: department.slug || '',
    isActive: !!department.isActive,
});
