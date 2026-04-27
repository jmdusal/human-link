import type { Tag, TagFormData } from '@/types';

export const INITIAL_TAG_FORM_STATE = (workspaceId: number): TagFormData => ({
    workspaceId: workspaceId,
    name: '',
    color: '',
});

export const formatTagFormData = (tag: Tag): TagFormData => ({
    workspaceId: tag.workspaceId,
    name: tag.name,
    color: tag.color ?? '',
});