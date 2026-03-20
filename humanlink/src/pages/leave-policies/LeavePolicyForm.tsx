import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import ModalForm from '@/components/modals/ModalForm';
import Input from '@/components/Input';
import api from '@/api/axios';
import type { LeavePolicy } from '@/types/models';
import { API_ROUTES } from '@/constants';

interface LeavePolicyFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (policyData: LeavePolicy) => void;
    onError: (error: any) => void;
    selectedLeavePolicy: LeavePolicy | null;
    
}

export default function LeavePolicyForm({ isOpen, onClose, onSuccess, onError, selectedLeavePolicy }: LeavePolicyFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({ 
        name: '',
        slug: '',
        defaultCredits: '0.00',
        isActive: true,
        isPaid: true,
    });
    
    const formatSlug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, '');

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
    
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        setFormData(prev => ({
            ...prev,
            name: newName,
            slug: formatSlug(newName)
        }));
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const saveRequest = selectedLeavePolicy
            ? api.put(API_ROUTES.LEAVE_POLICIES.UPDATE(selectedLeavePolicy.id), formData)
            : api.post(API_ROUTES.LEAVE_POLICIES.STORE, formData);

        setIsSubmitting(true);

        toast.promise(saveRequest, {
            loading: 'Processing request...',
            success: (res) => {
                onSuccess(res.data.data);
                onClose();
                return `Policy ${selectedLeavePolicy ? 'updated' : 'created'} successfully!`;
            },
            error: (err) => {
                onError(err);
                return err?.response?.data?.message || 'Failed to save policy.';
            }
        }).finally(() => setIsSubmitting(false));
    };

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
                    onChange={(e) => setFormData({ ...formData, defaultCredits: e.target.value })}
                    required
                />
                
                
            </div>
        </ModalForm>
    );
}