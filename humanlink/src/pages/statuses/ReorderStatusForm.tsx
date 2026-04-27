import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { StatusService } from '@/services/StatusService';
    import type { Status } from '@/types';
import ModalForm from '@/components/modals/ModalForm';

interface ReorderProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (newList: Status[]) => void;
    existingStatuses: Status[];
}

export default function ReorderStatusForm({ isOpen, onClose, onSuccess, existingStatuses }: ReorderProps) {
    const [list, setList] = useState<Status[]>(existingStatuses);
    const [isSaving, setIsSaving] = useState(false);
    const [enabled, setEnabled] = useState(false);

    useEffect(() => { 
        if (isOpen && existingStatuses) {
            const freshlySorted = [...existingStatuses].sort((a, b) => 
                Number(a.position) - Number(b.position)
            );
            setList(freshlySorted); 
        }
    }, [isOpen, existingStatuses]);

    useEffect(() => {
        const animation = requestAnimationFrame(() => setEnabled(true));
        return () => {
            cancelAnimationFrame(animation);
            setEnabled(false);
        };
    }, []);
    
    const onDragEnd = async (result: DropResult) => {
        if (!result.destination || result.destination.index === result.source.index) return;

        const items = Array.from(list);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        
        const updatedItems = items.map((item, index) => ({
            ...item,
            position: index 
        }));

        setList(updatedItems);
        setIsSaving(true);

        try {
            await StatusService.reorderStatuses(updatedItems.map(s => s.id));
            onSuccess(updatedItems); 
        } catch (error) {
            setList(existingStatuses); 
        } finally {
            setIsSaving(false);
        }
    };

    if (!enabled || !isOpen) return null;

    return (
        <ModalForm
            isOpen={isOpen} 
            onClose={onClose} 
            onSubmit={(e) => e.preventDefault()}
            title="Arrange Status Workflow"
            description="Drag to reorder. Changes sync instantly."
            loading={isSaving}
            showFooter={false}
        >
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="reorder-list">
                    {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-1.5 py-2">
                            {list.map((status, index) => (
                                <Draggable 
                                    key={status.id.toString()} 
                                    draggableId={status.id.toString()} 
                                    index={index}
                                >
                                    {(provided, snapshot) => (
                                        <div 
                                            ref={provided.innerRef} 
                                            {...provided.draggableProps} 
                                            {...provided.dragHandleProps}
                                            className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all duration-200 select-none ${
                                                snapshot.isDragging 
                                                ? "bg-white border-blue-500/30 shadow-[0_8px_30px_rgb(0,0,0,0.12)] scale-[1.01] z-50 ring-1 ring-blue-500/10" 
                                                : "bg-slate-50/50 border-transparent hover:border-slate-200 hover:bg-white hover:shadow-sm"
                                            }`}
                                        >
                                            <div className="text-slate-400 group-hover:text-slate-600 transition-colors">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                                    <circle cx="9" cy="5" r="1" fill="currentColor" />
                                                    <circle cx="9" cy="12" r="1" fill="currentColor" />
                                                    <circle cx="9" cy="19" r="1" fill="currentColor" />
                                                    <circle cx="15" cy="5" r="1" fill="currentColor" />
                                                    <circle cx="15" cy="12" r="1" fill="currentColor" />
                                                    <circle cx="15" cy="19" r="1" fill="currentColor" />
                                                </svg>
                                            </div>

                                            {/* Index Badge */}
                                            <span className="text-[10px] font-bold text-slate-400 w-4">
                                                {index}
                                            </span>
                                            
                                            {/* Status Dot with Glow */}
                                            <div className="relative flex items-center justify-center">
                                                <div 
                                                    className="w-2.5 h-2.5 rounded-full z-10" 
                                                    style={{ backgroundColor: status.colorHex }} 
                                                />
                                                <div 
                                                    className="absolute inset-0 w-2.5 h-2.5 rounded-full blur-[2px] opacity-40" 
                                                    style={{ backgroundColor: status.colorHex }} 
                                                />
                                            </div>
                                            
                                            <span className="flex-1 font-medium text-slate-600 text-sm tracking-tight">
                                                {status.name}
                                            </span>

                                            <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider transition-opacity ${snapshot.isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} bg-slate-100 text-slate-500`}>
                                                Move
                                            </div>
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>

            <div className="h-6 flex items-center justify-center mt-2">
                <div className={`flex items-center gap-2 transition-all duration-500 ${isSaving ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}>
                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" />
                    <span className="text-[11px] font-medium text-slate-500">
                        Saving changes to workflow...
                    </span>
                </div>
            </div>
        </ModalForm>
    );
}
