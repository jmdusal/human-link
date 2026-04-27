import React, { useEffect } from 'react';
import ModalForm from '@/components/modals/ModalForm';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import DateInput from '@/components/ui/DateInput';

import type { Task, TaskFormData, TaskPriority, Status, Tag } from '@/types';
import { TaskService } from '@/services/TaskService';
import { INITIAL_TASK_FORM_STATE, formatTaskFormData } from '@/utils/taskUtils';
import { useForm } from '@/hooks/use-form';
import { useUsers } from '@/hooks/use-users';
import { TASK_PRIORITY_OPTIONS } from '@/constants';
import MultiSelect from '@/components/ui/MultiSelect';

interface TaskFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (taskData: Task) => void;
    onError?: (error: any) => void;
    selectedTask: Task | null;
    projectId: number;
    statusId: number;
    statuses: Status[];
    tags: Tag[];
    tasks: Task[];
}

export default function TaskForm({ isOpen, onClose, onSuccess, selectedTask, projectId, statuses, statusId, tags, tasks }: TaskFormProps) {
    const form = useForm<TaskFormData>(INITIAL_TASK_FORM_STATE(projectId, statusId));
    const { userOptions, fetchProjectUsers } = useUsers(false);
    
    const onSubmit = (e: React.FormEvent) => {
        form.handleSubmit(
            e, 
            () => TaskService.saveTask(form.formData, selectedTask?.id),
            (data) => {
                onSuccess(data);
                onClose();
            },
            "Task",
            !!selectedTask
        );
    };
    
    const statusOptions = statuses.map(status => ({
        label: status.name,
        value: status.id.toString()
    }));
    
    const tagOptions = tags.map(tag => ({
        label: tag.name,
        value: Number(tag.id),
        // value: tag.id.toString()
    }));
    
    const taskOptions = tasks
    .filter(t => t.id !== selectedTask?.id)
    .map(task => ({ 
        label: task.title, 
        value: task.id.toString() 
    }));
    
    useEffect(() => {
        const state = selectedTask
            ? formatTaskFormData(selectedTask)
            // : INITIAL_TASK_FORM_STATE;
            : INITIAL_TASK_FORM_STATE(projectId, statusId);

        form.setFormData(state);
    }, [selectedTask, form.setFormData, projectId]); 
    
    useEffect(() => {
        if (isOpen && projectId) {
            fetchProjectUsers(projectId);
        }
    }, [isOpen, projectId, fetchProjectUsers]);

    return (
        <ModalForm
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={onSubmit}
            title={selectedTask ? "Edit Task" : "Create New Task"}
            description={selectedTask ? "MODIFY EXISTING" : "SETUP A NEW TASK"}
            isUpdate={!!selectedTask}
            loading={form.isSubmitting}
        >
            <div className="col-span-1 md:col-span-2 flex flex-col gap-5 py-2">
                
                <Input
                    label="Title"
                    placeholder="Enter title"
                    value={form.formData.title}
                    onChange={(e) => form.handleChange('title', e.target.value)}
                    error={form.errors.name?.[0]}
                />
                
                <Textarea
                    label="Description"
                    value={form.formData.description}
                    onChange={(e) => form.handleChange('description', e.target.value)}
                    error={form.errors.description?.[0]}
                    className="resize-none"
                />
                {form.errors.description && (
                    <p className="text-xs text-red-500 mt-1">{form.errors.description[0]}</p>
                )}
                <div className="grid grid-cols-2 gap-4">
                    {/* <DateInput
                        label="Due Date"
                        value={form.formData.dueDate}
                        onChange={(date) => {
                            const formatted = date ? date.toISOString().split('T')[0] : '';
                            form.handleChange('dueDate', formatted);
                        }}
                        // helperText="Task kickoff"
                    /> */}

                    <Select
                        label="Priority"
                        options={TASK_PRIORITY_OPTIONS}
                        value={form.formData.priority}
                        onChange={(val) => 
                            form.setFormData({ 
                                ...form.formData, 
                                priority: val as TaskPriority 
                            })
                        }
                    />
                    
                    <Select
                        label="Status"
                        options={statusOptions}
                        value={form.formData.statusId?.toString()}
                        onChange={(val) => 
                            form.handleChange('statusId', parseInt(val))
                        }
                    />

                </div>
                
                <MultiSelect
                    label="Tag"
                    placeholder="Tags"
                    options={tagOptions}
                    // selectedValues={form.formData.tagIds || []}
                    // onChange={(tagIds) => form.handleChange('tagIds', tagIds)}
                    selectedValues={(form.formData.tagIds || []).map(id => {
                        const tag = tags.find(t => t.id === id);
                        return {
                            id: id,
                            name: tag ? tag.name : '' 
                        };
                    })}
                    onChange={(selectedTags) => {
                        const ids = selectedTags.map((t: any) => t.id);
                        form.handleChange('tagIds', ids);
                    }}
                    
                />
                
                <MultiSelect
                    label="Assignee"
                    placeholder="Project members"
                    options={userOptions}
                    selectedValues={form.formData.assignees || []}
                    onChange={(assignees) => form.handleChange('assignees', assignees)}
                    showInitials={true}
                />
    
            </div>
        </ModalForm>
    );
}