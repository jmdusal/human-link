import type { Status, StatusFormData } from '@/types';

export const INITIAL_STATUS_FORM_STATE = (workspaceId: number, nextPosition: number): StatusFormData => ({
    workspaceId: workspaceId,
    name: '',
    colorHex: '',
    // position: nextPosition,
    position: Number(nextPosition),
});

export const formatStatusFormData = (status: Status): StatusFormData => ({
    workspaceId: status.workspaceId,
    name: status.name,
    colorHex: status.colorHex ?? '',
    position: Number(status.position),
});