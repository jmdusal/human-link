import React, { useEffect } from 'react';
import { LayoutTemplate, UserPlus } from 'lucide-react';
import ModalForm from '@/components/modals/ModalForm';
import Input from '@/components/ui/Input';
import type { Project, ProjectFormData, ProjectTemplate } from '@/types';
import { ProjectService } from '@/services/ProjectService';
import { INITIAL_PROJECT_FORM_STATE, formatProjectFormData, PROJECT_TEMPLATES } from '@/utils/projectUtils';
import { useForm } from '@/hooks/use-form';
import DateInput from '@/components/ui/DateInput';
import Textarea from '@/components/ui/Textarea';
import { useUsers } from '@/hooks/use-users';
import MultiSelect from '@/components/ui/MultiSelect';
import Card from '@/components/ui/Card';

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
    const memberCount = form.formData.projectMembers?.length || 0;

    const onSubmit = (e: React.FormEvent) => {
        form.handleSubmit(
            e,
            () => ProjectService.saveProject(form.formData, selectedProject?.id),
            (data) => {
                onSuccess(data);
                onClose();
            },
            'Project',
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
            title={selectedProject ? 'Edit Project' : 'Create New Project'}
            description={selectedProject ? 'MODIFY PROJECT DETAILS' : 'SETUP A NEW INITIATIVE'}
            isUpdate={!!selectedProject}
            loading={form.isSubmitting}
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
                    placeholder="Project goals..."
                    error={form.errors.description?.[0]}
                    className="resize-none"
                />

                {!selectedProject && (
                    <Card className="!p-4">
                        <div className="flex items-start gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center shrink-0">
                                <LayoutTemplate size={18} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-900">Project template</h4>
                                <p className="text-[12px] text-slate-400 font-medium mt-0.5">
                                    Required. Sets board statuses and starter tags from the template.
                                    If this workspace has no tasks yet, the board is replaced by the template
                                    (old Todo/In Progress/Done defaults are cleared).
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {PROJECT_TEMPLATES.map((template) => {
                                const selected = form.formData.template === template.key;
                                return (
                                    <button
                                        key={template.key}
                                        type="button"
                                        onClick={() =>
                                            form.handleChange('template', template.key as ProjectTemplate)
                                        }
                                        className={`text-left rounded-xl border px-3 py-3 transition-all ${
                                            selected
                                                ? 'border-blue-500 bg-blue-50 shadow-sm'
                                                : 'border-slate-200 bg-white hover:border-blue-200'
                                        }`}
                                    >
                                        <p className="text-sm font-bold text-slate-900">{template.label}</p>
                                        <p className="text-[11px] text-slate-400 font-medium mt-1 leading-snug">
                                            {template.description}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                        {form.errors.template?.[0] && (
                            <p className="text-[11px] text-red-500 font-medium mt-2">{form.errors.template[0]}</p>
                        )}
                    </Card>
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

                <Card className="!p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                <UserPlus size={18} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-900">Invite or Manage Members</h4>
                                <p className="text-[12px] text-slate-400 font-medium mt-0.5">
                                    Search people to add. Click a role chip to switch between member and admin.
                                </p>
                            </div>
                        </div>
                        <span className="inline-flex items-center self-start px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                            {memberCount} members
                        </span>
                    </div>

                    <MultiSelect
                        placeholder="Search users to invite..."
                        options={userOptions}
                        selectedValues={form.formData.projectMembers || []}
                        showRole={true}
                        showInitials={true}
                        onChange={(members) => {
                            const fullMemberData = members.map((item) => {
                                const fullUser = userOptions.find((u) => u.id === item.id || u.value === item.id);
                                return {
                                    ...item,
                                    email: item.email || fullUser?.email,
                                    status: item.status || fullUser?.status || 'active',
                                    pivot: item.pivot || { role: 'member' },
                                };
                            });
                            form.handleChange('projectMembers', fullMemberData);
                        }}
                    />
                </Card>
            </div>
        </ModalForm>
    );
}
