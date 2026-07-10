import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, AlignLeft, Tag as TagIcon, Users, Clock, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Task, TaskAttachment, TaskPriority, Status, Tag, User } from '@/types';
import { getInitials } from '@/utils/userUtils';
import { formatSimpleDate } from '@/utils/dateUtils';
import { useAuth } from '@/context/AuthContext';
import { TaskDiscussion } from '@/components/modals/tasks/section/TaskDiscussion';
import { TaskAttachments } from '@/components/modals/tasks/section/TaskAttachments';
import { TaskService } from '@/services/TaskService';
import { useUsers } from '@/hooks/use-users';
import { TASK_PRIORITY_OPTIONS } from '@/constants';
import Select from '@/components/ui/Select';
import MultiSelect from '@/components/ui/MultiSelect';
import DateInput from '@/components/ui/DateInput';
import { formatTaskFormData } from '@/utils/taskUtils';

interface TaskViewModalProps {
    task: Task | null;
    isOpen: boolean;
    onClose: () => void;
    statuses: Status[];
    tags: Tag[];
    canEdit?: boolean;
    onUpdate?: (task: Task) => void;
}

export const TaskViewModal: React.FC<TaskViewModalProps> = ({
    task,
    isOpen,
    onClose,
    statuses,
    tags,
    canEdit = true,
    onUpdate,
}) => {
    const { user: authUser } = useAuth();
    const { userOptions, fetchProjectUsers } = useUsers(false);
    const [shakeTrigger, setShakeTrigger] = useState(0);
    const [saving, setSaving] = useState(false);
    const [isEditingContent, setIsEditingContent] = useState(false);
    const [focusField, setFocusField] = useState<'title' | 'description'>('title');

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<TaskPriority>('medium');
    const [statusId, setStatusId] = useState<number | null>(null);
    const [dueDate, setDueDate] = useState('');
    const [assignees, setAssignees] = useState<User[]>([]);
    const [tagIds, setTagIds] = useState<number[]>([]);
    const [updatedAt, setUpdatedAt] = useState<string | null>(null);

    useEffect(() => {
        if (!task) return;
        setTitle(task.title || '');
        setDescription(task.description || '');
        setPriority(task.priority || 'medium');
        setStatusId(task.statusId);
        setDueDate(task.dueDate || '');
        setAssignees((task.assignees as User[]) || []);
        setTagIds(task.tags?.map((t) => t.id) || []);
        setUpdatedAt(task.updatedAt || null);
        setIsEditingContent(false);
    }, [task]);

    useEffect(() => {
        if (isOpen && task?.projectId) {
            fetchProjectUsers(task.projectId);
        }
    }, [isOpen, task?.projectId, fetchProjectUsers]);

    const handleBackdropClick = () => setShakeTrigger((prev) => prev + 1);

    if (!task) return null;

    const priorityStyles = {
        urgent: 'bg-red-500/10 text-red-500',
        high: 'bg-orange-500/10 text-orange-500',
        medium: 'bg-blue-500/10 text-blue-500',
        low: 'bg-slate-500/10 text-slate-500',
    };

    const statusOptions = statuses.map((status) => ({
        label: status.name,
        value: status.id.toString(),
    }));

    const tagOptions = tags.map((tag) => ({
        label: tag.name,
        value: Number(tag.id),
    }));

    const handleSave = async (overrides?: Partial<{ title: string; description: string; priority: TaskPriority; statusId: number | null; dueDate: string; assignees: User[]; tagIds: number[] }>) => {
        const nextTitle = (overrides?.title ?? title).trim();
        if (!canEdit || !nextTitle) return;
        setSaving(true);
        try {
            const payload = {
                ...formatTaskFormData(task),
                title: nextTitle,
                description: overrides?.description ?? description,
                priority: overrides?.priority ?? priority,
                statusId: overrides?.statusId ?? statusId ?? task.statusId,
                dueDate: overrides?.dueDate ?? dueDate,
                assignees: overrides?.assignees ?? assignees,
                tagIds: overrides?.tagIds ?? tagIds,
            };
            const updated = await TaskService.saveTask(payload, task.id);
            setUpdatedAt(updated.updatedAt || new Date().toISOString());
            onUpdate?.(updated);
            toast.success('Task updated');
            setIsEditingContent(false);
        } catch (error) {
            console.error('Update failed', error);
            toast.error('Failed to update task');
        } finally {
            setSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setTitle(task.title || '');
        setDescription(task.description || '');
        setIsEditingContent(false);
    };

    const handleStartEdit = (field: 'title' | 'description') => {
        if (!canEdit) return;
        setFocusField(field);
        setIsEditingContent(true);
    };

    const handleSidebarSave = (overrides: Partial<{ priority: TaskPriority; statusId: number | null; dueDate: string; assignees: User[]; tagIds: number[] }>) => {
        if (isEditingContent) {
            setTitle(task.title || '');
            setDescription(task.description || '');
            setIsEditingContent(false);
        }
        handleSave({
            ...overrides,
            title: task.title || '',
            description: task.description || '',
        });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 lg:p-12">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleBackdropClick}
                        className="absolute inset-0 bg-slate-950/40 backdrop-blur-xl"
                    />

                    <motion.div
                        key={shakeTrigger}
                        initial={{ opacity: 0, scale: 0.98, y: 20 }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            y: 0,
                            x: shakeTrigger > 0 ? [0, -5, 5, -5, 5, 0] : 0,
                        }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        exit={{ opacity: 0, scale: 0.98, y: 20 }}
                        className="relative w-full max-w-7xl h-fit max-h-[90vh] bg-white rounded-[32px] shadow-[0_32px_128px_-20px_rgba(0,0,0,0.3)] border border-slate-200/60 overflow-hidden flex flex-col"
                    >
                        <div className="px-8 py-4 border-b border-slate-100/80 flex justify-between items-center bg-white/50 backdrop-blur-md">
                            <div className="flex items-center gap-3">
                                <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${priorityStyles[priority]}`}>
                                    {priority}
                                </div>
                                {canEdit && (
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500 bg-blue-50 px-2 py-1 rounded-md">
                                        Editable
                                    </span>
                                )}
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-900">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-hidden flex min-h-0">
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
                                <div className="space-y-5">
                                    {canEdit ? (
                                        isEditingContent ? (
                                            <input
                                                autoFocus={focusField === 'title'}
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleSave();
                                                    }
                                                    if (e.key === 'Escape') handleCancelEdit();
                                                }}
                                                className="w-full text-3xl font-bold text-slate-900 tracking-tight leading-tight bg-transparent border-0 border-b border-blue-200 focus:outline-none pb-2"
                                                placeholder="Task title"
                                            />
                                        ) : (
                                            <h2
                                                onClick={() => handleStartEdit('title')}
                                                className="text-3xl font-bold text-slate-900 tracking-tight leading-[1.15] cursor-text rounded-lg hover:bg-slate-50 -mx-2 px-2 py-1 transition-colors"
                                            >
                                                {title || 'Untitled task'}
                                            </h2>
                                        )
                                    ) : (
                                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight leading-[1.15]">
                                            {task.title}
                                        </h2>
                                    )}

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                                            <AlignLeft size={14} /> Description
                                        </div>
                                        {canEdit ? (
                                            isEditingContent ? (
                                                <textarea
                                                    autoFocus={focusField === 'description'}
                                                    value={description}
                                                    onChange={(e) => setDescription(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Escape') handleCancelEdit();
                                                    }}
                                                    rows={4}
                                                    placeholder="Add task details..."
                                                    className="w-full text-slate-600 text-[15px] leading-relaxed bg-slate-50 border border-blue-200 rounded-2xl p-4 focus:outline-none focus:ring-4 focus:ring-blue-500/10 resize-none"
                                                />
                                            ) : (
                                                <div
                                                    onClick={() => handleStartEdit('description')}
                                                    className="text-slate-600 text-[15px] leading-relaxed max-w-3xl min-h-[96px] bg-slate-50 border border-slate-100 rounded-2xl p-4 cursor-text hover:border-slate-200 transition-colors whitespace-pre-wrap"
                                                >
                                                    {description || 'Add task details...'}
                                                </div>
                                            )
                                        ) : (
                                            <div className="text-slate-600 text-[15px] leading-relaxed max-w-3xl">
                                                {task.description || 'No description'}
                                            </div>
                                        )}
                                    </div>

                                    {canEdit && isEditingContent && (
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleSave()}
                                                disabled={saving || !title.trim()}
                                                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-[12px] font-bold hover:bg-blue-700 disabled:opacity-50 transition-all"
                                            >
                                                <Save size={13} />
                                                {saving ? 'Saving...' : 'Save'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleCancelEdit}
                                                disabled={saving}
                                                className="inline-flex items-center px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-[12px] font-bold hover:bg-slate-200 disabled:opacity-50 transition-all"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    )}

                                    <TaskAttachments
                                        task={task}
                                        canEdit={canEdit}
                                        onChange={(attachments: TaskAttachment[]) => {
                                            onUpdate?.({ ...task, attachments });
                                        }}
                                    />
                                </div>

                                <div className="space-y-8 pt-6 border-t border-slate-200/50">
                                    <TaskDiscussion task={task} authUser={authUser} />
                                </div>
                            </div>

                            <div className="w-80 border-l border-slate-100 bg-slate-50/30 p-6 space-y-6 overflow-y-auto">
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            Priority
                                        </label>
                                        {canEdit ? (
                                            <Select
                                                value={priority}
                                                onChange={(val) => {
                                                    const next = val as TaskPriority;
                                                    setPriority(next);
                                                    handleSidebarSave({ priority: next });
                                                }}
                                                options={[...TASK_PRIORITY_OPTIONS]}
                                            />
                                        ) : (
                                            <div className="text-[13px] font-semibold text-slate-900 capitalize">{priority}</div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            Status
                                        </label>
                                        {canEdit ? (
                                            <Select
                                                value={statusId?.toString() || ''}
                                                onChange={(val) => {
                                                    const next = Number(val);
                                                    setStatusId(next);
                                                    handleSidebarSave({ statusId: next });
                                                }}
                                                options={statusOptions}
                                            />
                                        ) : (
                                            <div className="text-[13px] font-semibold text-slate-900">
                                                {statuses.find((s) => s.id === task.statusId)?.name || '—'}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Calendar size={12} /> Due Date
                                        </label>
                                        {canEdit ? (
                                            <DateInput
                                                label="Due date"
                                                value={dueDate}
                                                onChange={(date) => {
                                                    const formatted = date ? date.toISOString().split('T')[0] : '';
                                                    setDueDate(formatted);
                                                    handleSidebarSave({ dueDate: formatted });
                                                }}
                                            />
                                        ) : (
                                            <div className="text-[13px] font-semibold text-slate-900">
                                                {formatSimpleDate(task.dueDate)}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Users size={12} /> Assignees
                                        </label>
                                        {canEdit ? (
                                            <MultiSelect
                                                placeholder="Project members"
                                                options={userOptions}
                                                selectedValues={assignees}
                                                onChange={(selected) => {
                                                    const next = selected as User[];
                                                    setAssignees(next);
                                                    handleSidebarSave({ assignees: next });
                                                }}
                                                showInitials
                                            />
                                        ) : (
                                            <div className="space-y-2">
                                                {task.assignees?.map((assignee) => (
                                                    <div key={assignee.id} className="flex items-center gap-3 p-1">
                                                        <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                                                            {getInitials(assignee.name)}
                                                        </div>
                                                        <span className="text-[13px] font-medium text-slate-700">{assignee.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <TagIcon size={12} /> Labels
                                        </label>
                                        {canEdit ? (
                                            <MultiSelect
                                                placeholder="Tags"
                                                options={tagOptions}
                                                selectedValues={tagIds.map((id) => {
                                                    const tag = tags.find((t) => t.id === id);
                                                    return { id, name: tag?.name || '' };
                                                })}
                                                onChange={(selected) => {
                                                    const next = selected.map((t: any) => t.id);
                                                    setTagIds(next);
                                                    handleSidebarSave({ tagIds: next });
                                                }}
                                            />
                                        ) : (
                                            <div className="flex flex-wrap gap-2">
                                                {task.tags?.map((tag) => (
                                                    <span
                                                        key={tag.id}
                                                        style={{ backgroundColor: `${tag.color}15`, color: tag.color, borderColor: `${tag.color}30` }}
                                                        className="px-2.5 py-1 border rounded-lg text-[10px] font-black uppercase tracking-widest"
                                                    >
                                                        {tag.name}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100 space-y-2">
                                    <div className="flex justify-between text-[11px] font-medium">
                                        <span className="text-slate-400">Created</span>
                                        <span className="text-slate-700">{formatSimpleDate(task.createdAt)}</span>
                                    </div>
                                    <div className="flex justify-between text-[11px] font-medium items-center gap-2">
                                        <span className="text-slate-400 inline-flex items-center gap-1">
                                            <Clock size={11} /> Updated
                                        </span>
                                        <span className="text-slate-700">{formatSimpleDate(updatedAt || task.updatedAt)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
