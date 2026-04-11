import type { Task, TaskFormData } from "@/types";

export const INITIAL_TASK_FORM_STATE = (projectId: number, statusId: number): TaskFormData => ({
    projectId: projectId,
    statusId: statusId,
    title: '',
    description: '',
    priority: 'medium',
    position: 0,
    dueDate: '',
    estimateMinutes: 0,
    parentId: null,
    assignees: [],
});

export const formatTaskFormData = (task: Task): TaskFormData => ({
    projectId: task.projectId,
    statusId: task.statusId,
    title: task.title,
    description: task.description ?? '',
    priority: task.priority,
    position: task.position,
    dueDate: task.dueDate ?? '',
    estimateMinutes: task.estimateMinutes ?? 0,
    parentId: task.parentId,
    assignees: task.assignees || [],
});

