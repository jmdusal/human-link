import React, { useEffect } from 'react';
import ModalForm from '@/components/modals/ModalForm';
import Input from '@/components/ui/Input';
import type { Permission, PermissionFormData } from '@/types';
import { PermissionService } from '@/services/PermissionService';
import { INITIAL_PERMISSION_FORM_STATE, formatPermissionFormData } from '@/utils/permissionUtils';
import { useForm } from '@/hooks/use-form';

interface PermissionFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (permissionData: Permission) => void;
    onError: (error: any) => void;
    selectedPermission: Permission | null;
}

export default function PermissionForm({ isOpen, onClose, onSuccess, selectedPermission }: PermissionFormProps) {
    const form = useForm<PermissionFormData>(INITIAL_PERMISSION_FORM_STATE);
    
    const onSubmit = (e: React.FormEvent) => {
        form.handleSubmit(e, () => PermissionService.savePermission(form.formData, selectedPermission?.id),
            (data) => {
                onSuccess(data);
                onClose();
            },
            "Permission",
            !!selectedPermission
        );
    };

    useEffect(() => {
        const state = selectedPermission
            ? formatPermissionFormData(selectedPermission) 
            : INITIAL_PERMISSION_FORM_STATE;

        form.setFormData(state);
    }, [selectedPermission, form.setFormData]); 

    return (
        <ModalForm
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={onSubmit}
            title={selectedPermission ? "Edit Permission" : "Create New Permission"}
            description={selectedPermission ? "MODIFY EXISTING CREDENTIALS" : "SETUP A NEW PERMISSION"}
            isUpdate={!!selectedPermission}
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
            </div>
        </ModalForm>
    );
}