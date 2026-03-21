import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import ModalForm from '@/components/modals/ModalForm';
import Input from '@/components/Input';
import api from '@/api/axios';
import type { Permission } from '@/types/models';
import { API_ROUTES } from '@/constants';
import { camelizeKeys } from '@/utils/formatUtils';

interface PermissionFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (permissionData: Permission) => void;
    onError: (error: any) => void;
    selectedPermission: Permission | null;
}

export default function PermissionForm({ isOpen, onClose, onSuccess, onError, selectedPermission }: PermissionFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [formData, setFormData] = useState({ 
        name: '',
    });
    
    const handleChange = (field: keyof typeof formData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        if (errors[field as string]) {
            const { [field as string]: _, ...rest } = errors;
            setErrors(rest);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setIsSubmitting(true);
        
        try {
            const res = selectedPermission
            ? await api.put(API_ROUTES.PERMISSIONS.UPDATE(selectedPermission.id), formData)
            : await api.post(API_ROUTES.PERMISSIONS.STORE, formData);
            
            toast.success(`Permission ${selectedPermission ? 'updated' : 'created'} successfully!`);
            onSuccess(res.data.data);
            onClose();
        } catch (err: any) {
            if (err.response?.status === 422) {
                const validationErrors = camelizeKeys(err.response.data.errors);
                setErrors(validationErrors);
            }
            onError(err);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    useEffect(() => {
        if (selectedPermission && isOpen) {
            setFormData({
                name: selectedPermission.name,
            });
        } else if (!selectedPermission && isOpen) {
            setFormData({ name: ''});
        }
    }, [selectedPermission, isOpen]);

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
                    onChange={(e) => handleChange('name', e.target.value)}
                    error={errors.name?.[0]}
                />
            </div>
        </ModalForm>
    );
}