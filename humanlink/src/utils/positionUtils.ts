import type { Position, PositionFormData } from '@/types';

export const INITIAL_POSITION_FORM_STATE: PositionFormData = {
    departmentId: '',
    name: '',
    slug: '',
    isActive: true,
};

export const formatPositionFormData = (position: Position): PositionFormData => ({
    departmentId: position.departmentId ? String(position.departmentId) : '',
    name: position.name || '',
    slug: position.slug || '',
    isActive: !!position.isActive,
});
