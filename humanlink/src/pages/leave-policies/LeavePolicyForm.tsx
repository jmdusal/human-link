import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import ModalForm from '@/components/modals/ModalForm';
import Input from '@/components/Input';
import api from '@/api/axios';
import type { LeavePolicy } from '@/types/models';
import { API_ROUTES } from '@/constants';
import { camelizeKeys } from '@/utils/formatUtils';

interface LeavePolicyFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (policyData: LeavePolicy) => void;
    onError: (error: any) => void;
    selectedLeavePolicy: LeavePolicy | null;
    
}

export default function LeavePolicyForm({ isOpen, onClose, onSuccess, onError, selectedLeavePolicy }: LeavePolicyFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [formData, setFormData] = useState({ 
        name: '',
        slug: '',
        defaultCredits: '0.00',
        isActive: true,
        isPaid: true,
    });
    
    const handleChange = (field: keyof typeof formData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        if (errors[field as string]) {
            const { [field as string]: _, ...rest } = errors;
            setErrors(rest);
        }
    };
    
    const formatSlug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        setFormData(prev => ({
            ...prev,
            name: newName,
            slug: formatSlug(newName)
        }));
        
        if (errors.name) {
            const { name, ...rest } = errors;
            setErrors(rest);
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setIsSubmitting(true);
        
        try {
            const res = selectedLeavePolicy
            ? await api.put(API_ROUTES.LEAVE_POLICIES.UPDATE(selectedLeavePolicy.id), formData)
            : await api.post(API_ROUTES.LEAVE_POLICIES.STORE, formData);
            
            toast.success(`Policy ${selectedLeavePolicy ? 'updated' : 'created'} successfully!`);
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
        if (selectedLeavePolicy && isOpen) {
            setFormData({
                name: selectedLeavePolicy.name,
                slug: selectedLeavePolicy.slug,
                defaultCredits: selectedLeavePolicy.defaultCredits.toString(),
                isActive: !!selectedLeavePolicy.isActive,
                isPaid: !!selectedLeavePolicy.isPaid,
            });
        } else if (!selectedLeavePolicy && isOpen) {
            setFormData({ 
                name: '', 
                slug: '', 
                defaultCredits: '0.00', 
                isActive: true, 
                isPaid: true 
            });
        }
    }, [selectedLeavePolicy, isOpen]);
    
    return (
        <ModalForm
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={handleSubmit}
            title={selectedLeavePolicy ? "Edit Policy" : "Create New Policy"}
            description={selectedLeavePolicy ? "MODIFY EXISTING POLICY" : "SETUP A NEW POLICY"}
            isUpdate={!!selectedLeavePolicy}
            loading={isSubmitting}
        >
            <div className="col-span-1 md:col-span-2 flex flex-col gap-5 py-2">
                <Input
                    label="Name"
                    placeholder="Enter name"
                    value={formData.name}
                    onChange={handleNameChange}
                    error={errors.name?.[0]}
                />
                
                <Input
                    label="Slug (Auto-generated)"
                    value={formData.slug}
                    readOnly
                    className="bg-gray-50 text-gray-500"
                />
                
                <Input
                    label="Default Credits"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.defaultCredits}
                    onChange={(e) => handleChange('defaultCredits', e.target.value)}
                    error={errors.defaultCredits?.[0]}
                />
                
                
            </div>
        </ModalForm>
    );
}