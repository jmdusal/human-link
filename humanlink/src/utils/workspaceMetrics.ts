type TaskLike = {
    statusId?: number;
    status_id?: number;
    assignees?: Array<{ id?: number; userId?: number }>;
};

type StatusLike = {
    id: number;
    name?: string;
    position?: number;
};

const DONE_STATUS_NAMES = new Set([
    'done',
    'completed',
    'closed',
    'delivered',
    'approved',
    'finished',
    'complete',
]);

export function getTaskStatusId(task: TaskLike): number | undefined {
    return task.statusId ?? task.status_id;
}

export function isDoneStatus(status: StatusLike | undefined | null): boolean {
    if (!status?.name) return false;
    const name = status.name.toLowerCase().trim();
    return DONE_STATUS_NAMES.has(name);
}

export function findDoneStatus<T extends StatusLike>(statuses: T[]): T | undefined {
    return statuses.find((status) => isDoneStatus(status));
}

export function getDoneStatusIds(statuses: StatusLike[]): number[] {
    return statuses.filter((status) => isDoneStatus(status)).map((status) => status.id);
}

export function isTaskDone(task: TaskLike, doneStatusIds: number[]): boolean {
    const statusId = getTaskStatusId(task);
    if (statusId == null || doneStatusIds.length === 0) return false;
    return doneStatusIds.includes(statusId);
}

export function isTaskOverdue(task: {
    dueDate?: string | null;
    due_date?: string | null;
    statusId?: number;
    status_id?: number;
}, doneStatusIds?: number | number[]): boolean {
    const dueDate = task.dueDate || task.due_date;
    if (!dueDate) return false;

    const statusId = getTaskStatusId(task);
    const ids = Array.isArray(doneStatusIds)
        ? doneStatusIds
        : doneStatusIds != null
            ? [doneStatusIds]
            : [];

    if (ids.length > 0 && statusId != null && ids.includes(statusId)) return false;

    const due = new Date(dueDate);
    if (Number.isNaN(due.getTime())) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);

    return due < today;
}

export function taskHasAssignee(task: TaskLike, userId: number): boolean {
    return (task.assignees || []).some(
        (assignee) => assignee.id === userId || assignee.userId === userId
    );
}

export function resolveWorkspaceStatuses(workspace: {
    statuses?: StatusLike[];
    taskStatuses?: StatusLike[];
    task_statuses?: StatusLike[];
}): StatusLike[] {
    return workspace.statuses
        || workspace.taskStatuses
        || workspace.task_statuses
        || [];
}

export function acceptedMembers<T extends { pivot?: { status?: string } }>(members: T[]): T[] {
    return (members || []).filter(
        (member) => (member.pivot?.status ?? 'accepted') === 'accepted'
    );
}
