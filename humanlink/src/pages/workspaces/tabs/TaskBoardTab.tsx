import type { DropResult } from '@hello-pangea/dnd';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { toast } from 'react-hot-toast';
import { Kanban, MoreVertical } from 'lucide-react';
import Searchbar from '@/components/shared/Searchbar';
import Button from '@/components/ui/Button';
import { TaskService } from '@/services/TaskService';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import Select from '@/components/ui/Select';
import { usePageTitle } from '@/hooks/use-title';

interface TaskBoardTabProps {
    data: any;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    // activeBoardProjectId: string | null;
    activeBoardProjectId: any;
    setActiveBoardProjectId: (id: any) => void;
    handleEditTask: (task: any) => void;
    handleDeleteTask: (task: any) => void;
    setSelectedTask: (task: any | null) => void;
    setIsTaskFormOpen: (open: boolean) => void;
    onTaskMove: (taskId: string | number, newStatusId: number, newPosition: number) => void;
}

export default function TaskBoardTab({ data, searchQuery, setSearchQuery, activeBoardProjectId, handleEditTask, handleDeleteTask, onTaskMove, setIsTaskFormOpen, setSelectedTask, setActiveBoardProjectId }: TaskBoardTabProps) {
    usePageTitle("Kanban Board")
    const { can } = useAuth();
    
    const allTasks = (data.projects || []).filter((project: any) => {
        return activeBoardProjectId ? project.id === activeBoardProjectId : false;
    })
    .flatMap((project: any) =>
        (project.tasks || []).map((task: any) => ({
            ...task,
            projectName: project.name
        }))
    );

    const filteredTasks = allTasks.filter((task: any) =>
        task.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const currentProject = data.projects?.find((p: any) => p.id === activeBoardProjectId);
    
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
                
                {/* this select of project */}
                <div className="flex items-center gap-3">
                    <div className="min-w-[300px]">
                        <Select
                            value={activeBoardProjectId ? activeBoardProjectId.toString() : ''}
                            onChange={(val: string) => setActiveBoardProjectId(val ? Number(val) : null)}
                            options={(data.projects || []).map((p: any) => ({
                                label: p.name,
                                value: p.id.toString()
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
                                setSelectedTask({
                                    projectId: activeBoardProjectId,
                                });
                                setIsTaskFormOpen(true);
                            }}
                        >
                            + New Task
                        </Button>
                    )}
                </div>
                {/* <div className="flex items-center gap-3">
                    <Select
                        value={activeBoardProjectId ? activeBoardProjectId.toString() : ''}
                        onChange={(val: string) => setActiveBoardProjectId(val ? Number(val) : null)}
                        options={(data.projects || []).map((p: any) => ({
                            label: p.name,
                            value: p.id.toString()
                        }))}
                    />

                    <Searchbar value={searchQuery} onChange={setSearchQuery} placeholder="Search tasks..." />

                    {can('tasks-create') && (
                        <Button
                            disabled={!activeBoardProjectId}
                            className="active:scale-[0.98] cursor-pointer font-bold text-xs uppercase tracking-widest px-6"
                            onClick={() => {
                                setSelectedTask({
                                    projectId: activeBoardProjectId,
                                });
                                // setSelectedTask(null);
                                setIsTaskFormOpen(true);
                            }}
                        >
                            + New Task
                        </Button>
                    )}
                </div> */}
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
                        <div className="flex gap-6 h-full min-h-0">
                            {(data.statuses || [])
                                .sort((a: any, b: any) => a.position - b.position)
                                .map((status: any) => {
                                    const statusTasks = filteredTasks
                                        .filter((task: any) => task.statusId === status.id)
                                        .sort((a: any, b: any) => a.position - b.position);

                                    return (
                                        <div 
                                            key={status.id} 
                                            className="flex-1 min-w-[320px] max-w-[450px] flex flex-col h-full bg-slate-50/40 rounded-[32px] p-4 border border-slate-100 shrink-0 overflow-hidden"
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
                                                        {statusTasks.map((task: any, index: number) => (
                                                            <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                                                                {(provided) => (
                                                                    <div
                                                                        ref={provided.innerRef}
                                                                        {...provided.draggableProps}
                                                                        {...provided.dragHandleProps}
                                                                        className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group/card"
                                                                        onClick={() => {
                                                                            handleEditTask(task)
                                                                            console.log('test', data)
                                                                            // console.log('test', task)
                                                                            
                                                                        }}
                                                                    >
                                                                        <div className="flex items-start justify-between mb-2">
                                                                            <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">
                                                                                {task.projectName}
                                                                            </span>
                                                                            <MoreVertical size={14} className="text-slate-300 group-hover/card:text-slate-500 cursor-pointer" />
                                                                        </div>
                                                                        <h5 className="text-sm font-bold text-slate-800 leading-snug">
                                                                            {task.title}
                                                                        </h5>
                                                                    </div>
                                                                )}
                                                            </Draggable>
                                                        ))}
                                                        {provided.placeholder}
                                                    </div>
                                                )}
                                            </Droppable>

                                            {/* Footer - Fixed */}
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
        </div>
    );
}
