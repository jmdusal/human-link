import type { DropResult } from '@hello-pangea/dnd';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { toast } from 'react-hot-toast';
import { Kanban, Pencil, Trash2 } from 'lucide-react';
import Searchbar from '@/components/shared/Searchbar';
import Button from '@/components/ui/Button';
import { TaskService } from '@/services/TaskService';
import { useAuth } from '@/context/AuthContext';
import Select from '@/components/ui/Select';
import { usePageTitle } from '@/hooks/use-title';
import type { Status, Task, Project, Tag } from '@/types';
import { TaskViewModal } from '@/components/modals/tasks/TaskViewModal';
import { useState } from 'react';

interface TaskBoardTabProps {
    data: any;
    statuses: Status[];
    tags: Tag[];
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    activeBoardProjectId: any;
    setActiveBoardProjectId: (id: any) => void;
    handleEditTask: (task: Task) => void;
    handleDeleteTask: (task: Task) => void;
    setSelectedTask: (task: any | null) => void;
    setIsTaskFormOpen: (open: boolean) => void;
    onTaskMove: (taskId: string | number, newStatusId: number, newPosition: number) => void;
}

export default function TaskBoardTab({ data, statuses, searchQuery, setSearchQuery, activeBoardProjectId, handleEditTask, handleDeleteTask, onTaskMove, setIsTaskFormOpen, setSelectedTask, setActiveBoardProjectId }: TaskBoardTabProps) {
    usePageTitle("Kanban Board")
    const { can } = useAuth();
    
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewedTask, setViewedTask] = useState<Task | null>(null);
    
    const handleViewTask = (task: Task) => {
        console.log('task data', task)
        setViewedTask(task);
        setIsViewModalOpen(true);
    };
    
    const allTasks = (data.projects || []).filter((project: Project) => {
        return activeBoardProjectId ? project.id === activeBoardProjectId : false;
    })
    .flatMap((project: Project) =>
        (project.tasks || []).map((task: Task) => ({
            ...task,
            projectName: project.name
        }))
    );

    const filteredTasks = allTasks.filter((task: Task) =>
        task.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const currentProject = data.projects?.find((project: Project) => project.id === activeBoardProjectId);
    
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
                statusId: newStatusId
            });
            
            toast.success("Task moved successfully");
        } catch (error) {
            console.error("DND Error:", error);
            toast.error("Failed to move task");
            
            onTaskMove(draggableId, parseInt(originalStatusId), 0);
        }
    };
    
    // useEffect(() => {
    //     console.log('wawawa', data)
    // })

    return (
        <div className="h-full flex flex-col overflow-hidden animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 shrink-0">
                <div>
                    <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
                        {currentProject ? `${currentProject.name} Board` : "Tasks"}
                    </h3>
                    <p className="text-slate-400 text-sm mt-1 font-medium">
                        {currentProject ? `Managing workflow for ${currentProject.name}` : `Select a project to view tasks`}
                    </p>
                </div>
                
                
                <div className="flex items-center gap-3">
                    
                    <div className="min-w-[300px]">
                        <Select
                            value={activeBoardProjectId ? activeBoardProjectId.toString() : ''}
                            onChange={(val: string) => setActiveBoardProjectId(val ? Number(val) : null)}
                            options={(data.projects || []).map((project: Project) => ({
                                label: project.name,
                                value: project.id.toString()
                            }))}
                        />
                    </div>

                    <div className="min-w-[240px]">
                        <Searchbar value={searchQuery} onChange={setSearchQuery} placeholder="Search tasks..." />
                    </div>

                    {can('tasks-create') && (
                        <Button
                            disabled={!activeBoardProjectId}
                            onClick={() => {
                                // setSelectedTask({
                                //     projectId: activeBoardProjectId,
                                // });
                                setSelectedTask(null);
                                setIsTaskFormOpen(true);
                            }}
                            className="disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            + New Task
                        </Button>
                    )}
                </div>
            </div>

            {!activeBoardProjectId ? (
                <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50 rounded-[40px] border-2 border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-white shadow-sm rounded-2xl flex items-center justify-center mb-6">
                        <Kanban className="text-slate-300" size={32} />
                    </div>
                    <h4 className="text-xl font-bold text-slate-900 tracking-tight">No Project Selected</h4>
                    <p className="text-slate-500 text-sm mt-1">Select a project from the Projects tab to view its tasks or you can select option on the top.</p>
                </div>
            ) : (

                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar pb-2 min-h-0">
                        <div className="flex gap-6 h-full min-h-0 w-full">
                            {statuses
                                .sort((a, b) => a.position - b.position)
                                .map((status) => {
                                    const statusTasks = filteredTasks
                                        .filter((task: any) => task.statusId === status.id)
                                        .sort((a: any, b: any) => a.position - b.position);
                                    return (
                                        <div
                                            key={status.id}
                                            className="flex-1 min-w-[300px] flex flex-col h-full bg-slate-50/40 rounded-[32px] p-4 border border-slate-100 shrink-0 overflow-hidden transition-all duration-300"
                                        >
                                            <div className="flex items-center justify-between mb-4 px-2 shrink-0">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: status.colorHex }} />
                                                    <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">
                                                        {status.name}
                                                    </h4>
                                                    <span className="text-[10px] font-bold text-slate-300 bg-white px-2 py-0.5 rounded-full border border-slate-100">
                                                        {statusTasks.length}
                                                    </span>
                                                </div>
                                            </div>
                                        
                                            <Droppable droppableId={status.id.toString()}>
                                                {(provided) => (
                                                    <div
                                                        {...provided.droppableProps}
                                                        ref={provided.innerRef}
                                                        className="flex-1 overflow-y-auto px-1 custom-scrollbar space-y-4 min-h-0"
                                                        
                                                    >
                                                        {statusTasks.map((task: Task, index: number) => (
                                                            <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                                                                {(provided) => (
                                                                    <div
                                                                        ref={provided.innerRef}
                                                                        {...provided.draggableProps}
                                                                        {...provided.dragHandleProps}
                                                                        className="group relative bg-white p-5 rounded-[22px] border border-slate-200/60 shadow-[0_2px_4px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] hover:border-slate-300/50 transition-all duration-300 ease-out cursor-grab active:cursor-grabbing active:scale-[0.98]"
                                                                        onClick={() => handleViewTask(task)}
                                                                    >
                                                                        
                                                                        <div className="absolute top-4 right-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out translate-y-1 group-hover:translate-y-0">
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleEditTask(task);
                                                                                }}
                                                                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:shadow-sm active:scale-90 active:bg-blue-100"
                                                                                title="Edit Task"
                                                                            >
                                                                                <Pencil size={13} strokeWidth={2.5} />
                                                                            </button>
                                                                            
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleDeleteTask(task);
                                                                                }}
                                                                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 hover:shadow-sm active:scale-90 active:bg-red-100"
                                                                                title="Delete Task"
                                                                            >
                                                                                <Trash2 size={13} strokeWidth={2.5} />
                                                                            </button>
                                                                        </div>

                                                                        <div className="flex flex-col h-full justify-between gap-4">
                                                                            <div className="space-y-2">
                                                                                {/* <div className="flex items-center gap-2">
                                                                                    <span className="text-[10px] font-bold text-blue-500/80 uppercase tracking-[0.15em] py-0.5 px-2 bg-blue-50/50 rounded-md">
                                                                                        {task.projectName || 'General'}
                                                                                    </span>
                                                                                </div> */}
                                                                                
                                                                                <h5 className="text-[14px] font-semibold text-slate-800 leading-relaxed group-hover:text-blue-600 transition-colors duration-200">
                                                                                    {task.title}
                                                                                </h5>
                                                                            </div>

                                                                            <div className="flex items-center justify-between mt-1 pt-4 border-t border-slate-50">
                                                                                {task.tags && task.tags.length > 0 && (
                                                                                    <div className="flex flex-wrap gap-1.5">
                                                                                        {task.tags.slice(0, 2).map((tag) => (
                                                                                            <div
                                                                                                key={tag.id}
                                                                                                className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white border border-slate-100 shadow-sm transition-all hover:border-slate-200"
                                                                                            >
                                                                                                <div 
                                                                                                    className="w-1.5 h-1.5 rounded-full shrink-0" 
                                                                                                    style={{ backgroundColor: tag.color }} 
                                                                                                />
                                                                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                                                                                                    {tag.name}
                                                                                                </span>
                                                                                            </div>
                                                                                        ))}
                                                                                        {task.tags.length > 2 && (
                                                                                            <span className="text-[9px] font-bold text-slate-300 ml-0.5">
                                                                                                +{task.tags.length - 2}
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                )}

                                                                                <div className="flex -space-x-2">
                                                                                    {task.assignees?.slice(0, 3).map((user, i) => (
                                                                                        <div 
                                                                                            key={i}
                                                                                            className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-500 uppercase shadow-sm"
                                                                                        >
                                                                                            {user.name.charAt(0)}
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
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

                                            <button
                                                className="mt-4 shrink-0 py-2.5 text-[10px] font-bold text-slate-400 hover:text-slate-900 border border-dashed border-slate-200 rounded-xl transition-all"
                                                onClick={() => {
                                                    setSelectedTask(null);
                                                    setIsTaskFormOpen(true);
                                                }}
                                            >
                                                + ADD TASK
                                            </button>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                </DragDropContext>
                
            )}
            
            <TaskViewModal
                isOpen={isViewModalOpen} 
                task={viewedTask} 
                onClose={() => {
                    setIsViewModalOpen(false);
                    setViewedTask(null);
                }} 
            />
        </div>
    );
}
