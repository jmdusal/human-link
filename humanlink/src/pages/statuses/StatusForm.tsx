import React, { useEffect, useState } from 'react';
import ModalForm from '@/components/modals/ModalForm';
import Input from '@/components/ui/Input';
import type { Status, StatusFormData } from '@/types';
import { StatusService } from '@/services/StatusService';
import { INITIAL_STATUS_FORM_STATE, formatStatusFormData } from '@/utils/statusUtils';
import { useForm } from '@/hooks/use-form';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';

interface StatusFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (statusData: Status) => void;
    workspaceId: number;
    selectedStatus: Status | null;
    currentCount: number;
    existingStatuses: Status[];
}

export default function StatusForm({ isOpen, onClose, onSuccess, workspaceId, selectedStatus, currentCount, existingStatuses }: StatusFormProps) {
    const form = useForm<StatusFormData>(INITIAL_STATUS_FORM_STATE(workspaceId, currentCount));
    const [previewList, setPreviewList] = useState<Status[]>(existingStatuses || []);

    useEffect(() => {
        setPreviewList(existingStatuses || []);
    }, [existingStatuses]);
    
    const onDragEnd = async (result: DropResult) => {
        if (!result.destination) return;

        const items = Array.from(previewList);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setPreviewList(items);
        
        form.handleChange('position', result.destination.index);

        try {
            const ids = items.map(s => s.id);
            await StatusService.reorderStatuses(ids);
        } catch (error) {
            console.error("Failed to save new order:", error);
            setPreviewList(existingStatuses); 
        }
    };


    // const onDragEnd = (result: DropResult) => {
    //     if (!result.destination) return;

    //     const items = Array.from(previewList);
    //     const [reorderedItem] = items.splice(result.source.index, 1);
    //     items.splice(result.destination.index, 0, reorderedItem);

    //     setPreviewList(items);
        
    //     // Sync the form "Position" field with where you dropped the item
    //     form.handleChange('position', result.destination.index);
    // };

    const onSubmit = (e: React.FormEvent) => {
        form.handleSubmit(e, () => StatusService.saveStatus(form.formData, selectedStatus?.id),
            (data) => {
                onSuccess(data);
                onClose();
            },
            "Status",
            !!selectedStatus
        );
    };

    useEffect(() => {
        const state = selectedStatus
            ? formatStatusFormData(selectedStatus) 
            : INITIAL_STATUS_FORM_STATE(workspaceId, currentCount);

        form.setFormData(state);
    }, [selectedStatus, workspaceId, currentCount, form.setFormData]); 

    return (
        <ModalForm
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={onSubmit}
            title={selectedStatus ? "Edit Status" : "Create New Status"}
            description={selectedStatus ? "MODIFY EXISTING CREDENTIALS" : "SETUP A NEW STATUS"}
            isUpdate={!!selectedStatus}
            loading={form.isSubmitting}
        >
            <div className="col-span-1 md:col-span-2 flex flex-col gap-5 py-2">
                <Input
                    label="Name"
                    placeholder="Enter name"
                    value={form.formData.name}
                    onChange={(e) => form.handleChange('name', e.target.value)}
                    error={form.errors.name?.[0]}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    <Input
                        label="Pick Color"
                        type="color"
                        value={form.formData.colorHex || '#626262'}
                        onChange={(e) => form.handleChange('colorHex', e.target.value)}
                        className="h-10 p-1 cursor-pointer"
                    />

                    <Input
                        label="Custom Hex Code"
                        placeholder="#FFFFFF"
                        value={form.formData.colorHex}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val.length <= 7) {
                                form.handleChange('colorHex', val);
                            }
                        }}
                        error={form.errors.colorHex?.[0]}
                    />
                </div>
                    
                <Input
                    label="Position"
                    type="number"
                    value={form.formData.position}
                    onChange={(e) => {
                        const val = e.target.valueAsNumber;
                        if (isNaN(val)) {
                            form.handleChange('position', ''); 
                            return;
                        }
                        form.handleChange('position', val);
                    }}
                    error={form.errors.position?.[0]}
                />

                {/* VISUAL RE-POSITIONING PREVIEW */}
                {/* <div className="mt-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">
                        Preview / Drag to Reorder
                    </label>
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="status-preview">
                            {(provided) => (
                                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-1 max-h-48 overflow-y-auto pr-1">
                                    {previewList?.map((status, index) => (
                                        <Draggable key={status.id.toString()} draggableId={status.id.toString()} index={index}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    className={`flex items-center gap-3 p-2 rounded border text-xs ${
                                                        snapshot.isDragging ? "bg-blue-50 border-blue-200" : "bg-white border-gray-100"
                                                    }`}
                                                >
                                                    <span className="w-5 h-5 flex items-center justify-center bg-gray-100 rounded font-bold text-gray-500">
                                                        {index}
                                                    </span>
                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: status.colorHex || status.colorHex }} />
                                                    <span className="truncate flex-1">{status.name}</span>
                                                    {selectedStatus?.id === status.id && <span className="text-[9px] text-blue-500 font-bold">CURRENT</span>}
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </div> */}
            </div>
        </ModalForm>
    );
}
