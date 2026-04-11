import React, { useEffect } from 'react';
import ModalForm from '@/components/modals/ModalForm';
import Input from '@/components/ui/Input';
import type { Project, ProjectFormData } from '@/types';
import { ProjectService } from '@/services/ProjectService';
import { INITIAL_PROJECT_FORM_STATE, formatProjectFormData } from '@/utils/projectUtils';
import { useForm } from '@/hooks/use-form';
import DateInput from '@/components/ui/DateInput';
import Textarea from '@/components/ui/Textarea';
import { useUsers } from '@/hooks/use-users';
import MultiSelect from '@/components/ui/MultiSelect'; 

interface ProjectFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (project: Project) => void;
    workspaceId: number;
    selectedProject: Project | null;
}

export default function ProjectForm({ isOpen, onClose, onSuccess, workspaceId, selectedProject }: ProjectFormProps) {
    const form = useForm<ProjectFormData>(INITIAL_PROJECT_FORM_STATE(workspaceId));
    const { userOptions, fetchWorkspaceUsers } = useUsers(false);
    
    const onSubmit = (e: React.FormEvent) => {
        form.handleSubmit(
            e, 
            () => ProjectService.saveProject(form.formData, selectedProject?.id),
            (data) => {
                onSuccess(data);
                onClose();
            },
            "Project",
            !!selectedProject
        );
    };

    useEffect(() => {
        const state = selectedProject
            ? formatProjectFormData(selectedProject) 
            : INITIAL_PROJECT_FORM_STATE(workspaceId);

        form.setFormData(state);
    }, [selectedProject, workspaceId, form.setFormData]); 
    
    useEffect(() => {
        if (isOpen && workspaceId) {
            fetchWorkspaceUsers(workspaceId);
        }
    }, [isOpen, workspaceId, fetchWorkspaceUsers]);

    return (
        <ModalForm
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={onSubmit}
            title={selectedProject ? "Edit Project" : "Create New Project"}
            description={selectedProject ? "MODIFY PROJECT DETAILS" : "SETUP A NEW INITIATIVE"}
            isUpdate={!!selectedProject}
            loading={form.isSubmitting}
            // size="xl"
        >
            <div className="col-span-1 md:col-span-2 flex flex-col gap-5 py-2">
                <Input
                    label="Project Name"
                    placeholder="Enter project name"
                    value={form.formData.name}
                    onChange={(e) => form.handleChange('name', e.target.value)}
                    error={form.errors.name?.[0]}
                />
                
                <Textarea
                    label="Description"
                    value={form.formData.description}
                    onChange={(e) => form.handleChange('description', e.target.value)}
                    // onChange={(value) => form.handleChange('description', value)}
                    placeholder="Project goals..."
                    error={form.errors.description?.[0]}
                    className="resize-none"
                />
                {form.errors.description && (
                    <p className="text-xs text-red-500 mt-1">{form.errors.description[0]}</p>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <DateInput
                        label="Start Date"
                        value={form.formData.startDate}
                        onChange={(date) => {
                            const formatted = date ? date.toISOString().split('T')[0] : '';
                            form.handleChange('startDate', formatted);
                        }}
                        helperText="Project kickoff"
                    />
                    <DateInput
                        label="End Date"
                        value={form.formData.endDate}
                        onChange={(date) => {
                            const formatted = date ? date.toISOString().split('T')[0] : '';
                            form.handleChange('endDate', formatted);
                        }}
                        helperText="Estimated completion"
                    />
                </div>
                
                <MultiSelect
                    label="Project Members"
                    options={userOptions}
                    selectedValues={form.formData.projectMembers || []}
                    onChange={(members) => form.handleChange('projectMembers', members)}
                    showRole={true}
                />
            </div>
        </ModalForm>
    );
}