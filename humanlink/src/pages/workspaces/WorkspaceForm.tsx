import React, { useEffect } from 'react';
import ModalForm from '@/components/modals/ModalForm';
import Input from '@/components/ui/Input';
import type { Workspace, WorkspaceFormData } from '@/types';
import { WorkspaceService } from '@/services/WorkspaceService';
import { INITIAL_WORKSPACE_FORM_STATE, formatWorkspaceFormData } from '@/utils/workspaceUtil';
import { useForm } from '@/hooks/use-form';
import { useUsers } from '@/hooks/use-users';
import MultiSelect from '@/components/ui/MultiSelect';

interface WorkspaceFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (workspaceData: Workspace) => void;
    onError?: (error: any) => void;
    selectedWorkspace: Workspace | null;
}

export default function WorkspaceForm({ isOpen, onClose, onSuccess, selectedWorkspace }: WorkspaceFormProps) {
    const { userOptions } = useUsers(isOpen);
    const form = useForm<WorkspaceFormData>(INITIAL_WORKSPACE_FORM_STATE);
    
    const onSubmit = (e: React.FormEvent) => {
        form.handleSubmit(
            e, 
            () => WorkspaceService.saveWorkspace(form.formData, selectedWorkspace?.id),
            (data) => {
                onSuccess(data);
                onClose();
            },
            "Workspace",
            !!selectedWorkspace
        );
    };
    
    // const handleMemberChange = (userId: string | number) => {
    //     const option = userOptions.find(opt => opt.value === Number(userId));
        
    //     if (option) {
    //         const alreadyAdded = form.formData.members?.some(m => m.id === option.value);
            
    //         if (!alreadyAdded) {
    //             const newMember = {
    //                 id: option.value,
    //                 name: option.label,
    //             } as any; 

    //             form.handleChange('members', [...(form.formData.members || []), newMember]);
    //         }
    //     }
    // };

    useEffect(() => {
        const state = selectedWorkspace
            ? formatWorkspaceFormData(selectedWorkspace) 
            : INITIAL_WORKSPACE_FORM_STATE;

        form.setFormData(state);
    }, [selectedWorkspace, form.setFormData]); 

    return (
        <ModalForm
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={onSubmit}
            title={selectedWorkspace ? "Edit Workspace" : "Create New Workspace"}
            description={selectedWorkspace ? "MODIFY EXISTING WORKSPACE" : "SETUP A NEW ENVIRONMENT"}
            isUpdate={!!selectedWorkspace}
            loading={form.isSubmitting}
        >
            <div className="col-span-1 md:col-span-2 flex flex-col gap-5 py-2">
                <Input
                    label="Workspace Name"
                    placeholder="e.g. Acme Corp, Marketing Team"
                    value={form.formData.name}
                    onChange={(e) => form.handleChange('name', e.target.value)}
                    error={form.errors.name?.[0]}
                    required
                />

                <MultiSelect
                    label="Add Members"
                    helperText="Click on a role (e.g., MEMBER) to toggle to ADMIN"
                    lockedIds={selectedWorkspace?.ownerId ? [selectedWorkspace.ownerId] : []}
                    placeholder="Search and add members..."
                    options={userOptions}
                    selectedValues={form.formData.members || []}
                    onChange={(users) => form.handleChange('members', users)}
                    showRole={true}
                />
                
            </div>
        </ModalForm>
    );
}
