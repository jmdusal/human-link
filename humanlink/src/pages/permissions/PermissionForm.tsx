import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import ModalForm from '@/components/modals/ModalForm';
import Input from '@/components/Input';
import api from '@/api/axios';
import type { Permission } from '@/types/models';
import { API_ROUTES } from '@/constants';

interface PermissionFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (permissionData: Permission) => void;
    onError: (error: any) => void;
    selectedPermission: Permission | null;
}

export default function PermissionForm({ isOpen, onClose, onSuccess, onError, selectedPermission }: PermissionFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({ 
        name: '',
    });

    useEffect(() => {
        if (selectedPermission && isOpen) {
            setFormData({
                name: selectedPermission.name,
            });
        } else if (!selectedPermission && isOpen) {
            setFormData({ name: ''});
        }
    }, [selectedPermission, isOpen]);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const saveRequest = selectedPermission
            ? api.put(API_ROUTES.PERMISSIONS.UPDATE(selectedPermission.id), formData)
            : api.post(API_ROUTES.PERMISSIONS.STORE, formData);

        setIsSubmitting(true);

        toast.promise(saveRequest, {
            loading: 'Processing request...',
            success: (res) => {
                onSuccess(res.data.data);
                onClose();
                return `Permission ${selectedPermission ? 'updated' : 'created'} successfully!`;
            },
            error: (err) => {
                onError(err);
                return err?.response?.data?.message || 'Failed to save permission.';
            }
        }).finally(() => setIsSubmitting(false));
    };

    return (
        <ModalForm
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={handleSubmit}
            title={selectedPermission ? "Edit Permission" : "Create New Permission"}
            description={selectedPermission ? "MODIFY EXISTING CREDENTIALS" : "SETUP A NEW OPERATOR"}
            isUpdate={!!selectedPermission}
            loading={isSubmitting}
        >
            <div className="col-span-1 md:col-span-2 flex flex-col gap-5 py-2">
                <Input
                    label="Name"
                    placeholder="Enter name"
                    value={formData.name}
                    onChange={(e) => setFormData({
                        ...formData,
                        name:
                        e.target.value
                    })}
                />
            </div>
        </ModalForm>
    );
}