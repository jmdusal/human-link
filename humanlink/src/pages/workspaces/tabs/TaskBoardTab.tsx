import type { DropResult } from '@hello-pangea/dnd';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { toast } from 'react-hot-toast';
import { CalendarClock, FolderKanban, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import Searchbar from '@/components/shared/Searchbar';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { TaskService } from '@/services/TaskService';
import { usePageTitle } from '@/hooks/use-title';
import type { Status, Task, Project, Tag } from '@/types';
import { TaskViewModal } from '@/components/modals/tasks/TaskViewModal';
import { getDoneStatusIds, isTaskOverdue } from '@/utils/workspaceMetrics';
import { useWorkspacePermissions } from '@/utils/workspacePermissions';

const PILL_LIMIT = 6;

interface TaskBoardTabProps {
    data: any;
    statuses: Status[];
    tags: Tag[];
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    activeBoardProjectId: number | null;
    setActiveBoardProjectId: (id: number | null) => void;
    handleEditTask: (task: Task) => void;
    handleDeleteTask: (task: Task) => void;
    setSelectedTask: (task: any | null) => void;
    setIsTaskFormOpen: (open: boolean) => void;
    onTaskMove: (taskId: string | number, newStatusId: number, newPosition: number) => void;
    onTaskUpdate?: (task: Task) => void;
}

export default function TaskBoardTab({
    data,
    statuses,
    tags,
    searchQuery,
    setSearchQuery,
    activeBoardProjectId,
    handleEditTask,
    handleDeleteTask,
    onTaskMove,
    setIsTaskFormOpen,
    setSelectedTask,
    setActiveBoardProjectId,
    onTaskUpdate,
}: TaskBoardTabProps) {
    usePageTitle('Kanban Board');

    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewedTask, setViewedTask] = useState<Task | null>(null);
    const [showOverdueOnly, setShowOverdueOnly] = useState(false);
    const pillsRef = useRef<HTMLDivElement>(null);

    const projects: Project[] = data.projects || [];
    const useProjectDropdown = projects.length > PILL_LIMIT;
    const doneStatusIds = getDoneStatusIds(statuses);

    const {
        canCreateOrDeleteTasks,
        canUpdateTasks: canEditTask,
    } = useWorkspacePermissions(data);
    const canCreateTask = canCreateOrDeleteTasks;
    const canDeleteTask = canCreateOrDeleteTasks;

    const projectOptions = useMemo(
        () =>
            projects.map((project) => ({
                label: `${project.name} (${project.tasks?.length || 0})`,
                value: project.id.toString(),
            })),
        [projects]
    );

    useEffect(() => {
        if (!projects.length) {
            if (activeBoardProjectId !== null) setActiveBoardProjectId(null);
            return;
        }

        const stillExists = projects.some((project) => project.id === activeBoardProjectId);
        if (!activeBoardProjectId || !stillExists) {
            setActiveBoardProjectId(projects[0].id);
        }
    }, [projects, activeBoardProjectId, setActiveBoardProjectId]);

    useEffect(() => {
        if (useProjectDropdown || !activeBoardProjectId || !pillsRef.current) return;
        const activePill = pillsRef.current.querySelector<HTMLElement>(`[data-project-id="${activeBoardProjectId}"]`);
        activePill?.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
    }, [activeBoardProjectId, useProjectDropdown]);

    const handleViewTask = (task: Task) => {
        setViewedTask(task);
        setIsViewModalOpen(true);
    };

    const allTasks = projects
        .filter((project) => project.id === activeBoardProjectId)
        .flatMap((project) =>
            (project.tasks || []).map((task: Task) => ({
                ...task,
                projectName: project.name,
            }))
        );

    const filteredTasks = allTasks.filter((task: Task) => {
        const matchesSearch = task.title?.toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchesSearch) return false;
        if (!showOverdueOnly) return true;
        return isTaskOverdue(task, doneStatusIds);
    });

    const overdueCount = allTasks.filter((task: Task) => isTaskOverdue(task, doneStatusIds)).length;

    const currentProject = projects.find((project) => project.id === activeBoardProjectId);

    const onDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
            return;
        }

        const originalStatusId = source.droppableId;
        const newStatusId = parseInt(destination.droppableId);

        onTaskMove(draggableId, newStatusId, 0);

        try {
            await TaskService.updateTaskPosition(draggableId, {
                statusId: newStatusId,
            });
            toast.success('Task moved successfully');
        } catch (error) {
            console.error('DND Error:', error);
            toast.error('Failed to move task');
            onTaskMove(draggableId, parseInt(originalStatusId), 0);
        }
    };

    if (!projects.length) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
                <div className="w-12 h-12 bg-white shadow-sm rounded-xl flex items-center justify-center mb-4">
                    <FolderKanban className="text-slate-300" size={24} />
                </div>
                <h4 className="text-lg font-bold text-slate-900 tracking-tight">No projects yet</h4>
                <p className="text-slate-500 text-sm mt-1">Create a project first, then manage its tasks here.</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Compact toolbar */}
            <div className="shrink-0 flex flex-col gap-3 mb-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        {useProjectDropdown ? (
                            <div className="w-[200px] shrink-0">
                                <Select
                                    value={activeBoardProjectId?.toString() || ''}
                                    onChange={(val) => setActiveBoardProjectId(Number(val))}
                                    options={projectOptions}
                                    placeholder="Select project"
                                />
                            </div>
                        ) : (
                            <div
                                ref={pillsRef}
                                className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar min-w-0"
                            >
                                {projects.map((project) => {
                                    const isActive = project.id === activeBoardProjectId;
                                    const taskCount = project.tasks?.length || 0;

                                    return (
                                        <button
                                            key={project.id}
                                            type="button"
                                            data-project-id={project.id}
                                            onClick={() => setActiveBoardProjectId(project.id)}
                                            className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                                                isActive
                                                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                                                    : 'bg-white text-slate-500 border border-slate-200 hover:border-blue-200 hover:text-blue-600'
                                            }`}
                                        >
                                            <FolderKanban size={12} className={isActive ? 'text-blue-100' : 'text-slate-400'} />
                                            <span className="max-w-[120px] truncate">{project.name}</span>
                                            <span className={`text-[9px] tabular-nums px-1 py-0.5 rounded ${
                                                isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'
                                            }`}>
                                                {taskCount}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            type="button"
                            onClick={() => setShowOverdueOnly((prev) => !prev)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
                                showOverdueOnly
                                    ? 'bg-rose-600 text-white border-rose-600'
                                    : 'bg-white text-slate-500 border-slate-200 hover:border-rose-200 hover:text-rose-600'
                            }`}
                        >
                            <CalendarClock size={12} />
                            Overdue
                            {overdueCount > 0 && (
                                <span className={`text-[9px] tabular-nums px-1 py-0.5 rounded ${
                                    showOverdueOnly ? 'bg-white/20 text-white' : 'bg-rose-50 text-rose-500'
                                }`}>
                                    {overdueCount}
                                </span>
                            )}
                        </button>
                        <div className="w-[180px]">
                            <Searchbar value={searchQuery} onChange={setSearchQuery} placeholder="Search..." />
                        </div>
                        {canCreateTask && (
                            <Button
                                variant="primary"
                                icon={Plus}
                                disabled={!activeBoardProjectId}
                                onClick={() => {
                                    setSelectedTask(null);
                                    setIsTaskFormOpen(true);
                                }}
                                className="disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                New Task
                            </Button>
                        )}
                    </div>
                </div>

                <div className="flex items-baseline gap-2">
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight truncate">
                        {currentProject?.name || 'Board'}
                    </h3>
                    <span className="text-[11px] text-slate-400 font-medium shrink-0">
                        {filteredTasks.length} tasks
                    </span>
                </div>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar min-h-0">
                    <div
                        className="flex gap-3 h-full min-h-0"
                        style={{
                            width: '100%',
                            minWidth: `max(100%, ${statuses.length * 272}px)`,
                        }}
                    >
                        {statuses
                            .sort((a, b) => a.position - b.position)
                            .map((status) => {
                                const statusTasks = filteredTasks
                                    .filter((task: any) => task.statusId === status.id)
                                    .sort((a: any, b: any) => a.position - b.position);

                                return (
                                    <div
                                        key={status.id}
                                        className="flex-1 min-w-[260px] flex flex-col h-full bg-slate-100/60 rounded-2xl p-2.5 border border-slate-200/60 overflow-hidden"
                                    >
                                        <div className="flex items-center gap-2 mb-2.5 px-1.5 shrink-0">
                                            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: status.colorHex }} />
                                            <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-[0.15em] truncate">
                                                {status.name}
                                            </h4>
                                            <span className="text-[10px] font-bold text-slate-400 bg-white px-1.5 py-0.5 rounded-md border border-slate-100 tabular-nums">
                                                {statusTasks.length}
                                            </span>
                                        </div>

                                        <Droppable droppableId={status.id.toString()}>
                                            {(provided) => (
                                                <div
                                                    {...provided.droppableProps}
                                                    ref={provided.innerRef}
                                                    className="flex-1 overflow-y-auto custom-scrollbar space-y-2 min-h-0 px-0.5"
                                                >
                                                    {statusTasks.map((task: Task, index: number) => (
                                                        <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                                                            {(provided) => (
                                                                <div
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                    className="group relative bg-white p-3 rounded-xl border border-slate-200/70 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-grab active:cursor-grabbing active:scale-[0.98]"
                                                                    onClick={() => handleViewTask(task)}
                                                                >
                                                                    <div className="absolute top-2 right-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        {canEditTask && (
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleEditTask(task);
                                                                                }}
                                                                                className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                                                                                title="Edit Task"
                                                                            >
                                                                                <Pencil size={12} strokeWidth={2.5} />
                                                                            </button>
                                                                        )}
                                                                        {canDeleteTask && (
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleDeleteTask(task);
                                                                                }}
                                                                                className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md"
                                                                                title="Delete Task"
                                                                            >
                                                                                <Trash2 size={12} strokeWidth={2.5} />
                                                                            </button>
                                                                        )}
                                                                    </div>

                                                                    <h5 className="text-[13px] font-semibold text-slate-800 leading-snug pr-8 group-hover:text-blue-600 transition-colors">
                                                                        {task.title}
                                                                    </h5>

                                                                    {task.dueDate && (
                                                                        <div className={`mt-2 inline-flex items-center gap-1 text-[10px] font-bold ${
                                                                            isTaskOverdue(task, doneStatusIds)
                                                                                ? 'text-rose-600'
                                                                                : 'text-slate-400'
                                                                        }`}>
                                                                            <CalendarClock size={11} />
                                                                            {new Date(task.dueDate).toLocaleDateString()}
                                                                            {isTaskOverdue(task, doneStatusIds) && (
                                                                                <span className="uppercase tracking-wide">Overdue</span>
                                                                            )}
                                                                        </div>
                                                                    )}

                                                                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-50 gap-2">
                                                                        {task.tags && task.tags.length > 0 ? (
                                                                            <div className="flex flex-wrap gap-1 min-w-0">
                                                                                {task.tags.slice(0, 2).map((tag) => (
                                                                                    <div
                                                                                        key={tag.id}
                                                                                        className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-slate-50 border border-slate-100"
                                                                                    >
                                                                                        <div
                                                                                            className="w-1.5 h-1.5 rounded-full shrink-0"
                                                                                            style={{ backgroundColor: tag.color }}
                                                                                        />
                                                                                        <span className="text-[8px] font-bold text-slate-400 uppercase truncate max-w-[60px]">
                                                                                            {tag.name}
                                                                                        </span>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        ) : (
                                                                            <span />
                                                                        )}

                                                                        <div className="flex -space-x-1.5 shrink-0">
                                                                            {task.assignees?.slice(0, 3).map((user, i) => (
                                                                                <div
                                                                                    key={i}
                                                                                    className="w-5 h-5 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[7px] font-bold text-slate-500 uppercase"
                                                                                >
                                                                                    {user.name.charAt(0)}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    ))}
                                                    {provided.placeholder}
                                                </div>
                                            )}
                                        </Droppable>

                                        {canCreateTask && (
                                            <button
                                                className="mt-2 shrink-0 py-1.5 text-[10px] font-bold text-slate-400 hover:text-blue-600 hover:bg-white/80 border border-dashed border-slate-200 hover:border-blue-200 rounded-lg transition-all"
                                                onClick={() => {
                                                    setSelectedTask(null);
                                                    setIsTaskFormOpen(true);
                                                }}
                                            >
                                                + Add task
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                    </div>
                </div>
            </DragDropContext>

            <TaskViewModal
                isOpen={isViewModalOpen}
                task={viewedTask}
                statuses={statuses}
                tags={tags}
                canEdit={canEditTask}
                onUpdate={(updated) => {
                    setViewedTask(updated);
                    onTaskUpdate?.(updated);
                }}
                onClose={() => {
                    setIsViewModalOpen(false);
                    setViewedTask(null);
                }}
            />
        </div>
    );
}
