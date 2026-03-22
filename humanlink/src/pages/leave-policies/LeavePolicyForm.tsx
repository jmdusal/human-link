import React, { useEffect } from 'react';
import ModalForm from '@/components/modals/ModalForm';
import Input from '@/components/Input';
import Toggle from '@/components/Toggle';
import type { LeavePolicy, LeavePolicyFormData } from '@/types/models';
import { LeavePolicyService } from '@/services/LeavePolicyService';
import { INITIAL_LEAVE_POLICY_FORM_STATE, formatLeavePolicyFormData } from '@/utils/leavepolicyUtils';
import { useForm } from '@/hooks/useForm';

interface LeavePolicyFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (policyData: LeavePolicy) => void;
    onError: (error: any) => void;
    selectedLeavePolicy: LeavePolicy | null;
}

export default function LeavePolicyForm({ isOpen, onClose, onSuccess, selectedLeavePolicy }: LeavePolicyFormProps) {
    const form = useForm<LeavePolicyFormData>(INITIAL_LEAVE_POLICY_FORM_STATE);
    
    const onSubmit = (e: React.FormEvent) => {
        form.handleSubmit(e, () => LeavePolicyService.savePolicy(form.formData, selectedLeavePolicy?.id),
            (data) => {
                onSuccess(data);
                onClose();
            },
            "Policy",
                !selectedLeavePolicy
        );
    };
    
    const formatSlug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        form.setFormData(prev => ({
            ...prev,
            name: newName,
            slug: formatSlug(newName)
        }));
        
        if (form.errors.name) {
            const { name, ...rest } = form.errors;
            form.setErrors(rest);
        }
    };
    
    useEffect(() => {
        const state = selectedLeavePolicy
            ? formatLeavePolicyFormData(selectedLeavePolicy) 
            : INITIAL_LEAVE_POLICY_FORM_STATE;

        form.setFormData(state);
    }, [selectedLeavePolicy, form.setFormData]); 

    return (
        <ModalForm
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={onSubmit}
            title={selectedLeavePolicy ? "Edit Policy" : "Create New Policy"}
            description={selectedLeavePolicy ? "MODIFY EXISTING POLICY" : "SETUP A NEW POLICY"}
            isUpdate={!!selectedLeavePolicy}
            loading={form.isSubmitting}
        >
            <div className="col-span-1 md:col-span-2 flex flex-col gap-5 py-2">
                <Input
                    label="Name"
                    placeholder="Enter name"
                    value={form.formData.name}
                    onChange={handleNameChange}
                    error={form.errors.name?.[0]}
                />
                <Input
                    label="Slug (Auto-generated)"
                    value={form.formData.slug}
                    readOnly
                    className="bg-gray-50 text-gray-500"
                />
                <Input
                    label="Default Credits"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={form.formData.defaultCredits}
                    onChange={(e) => form.handleChange('defaultCredits', e.target.value)}
                    onFocus={(e) => {
                        if (form.formData.defaultCredits === '0.00') {
                            form.handleChange('defaultCredits', '');
                        } else {
                            e.target.select();
                        }
                    }}
                    onBlur={(e) => {
                        const val = parseFloat(e.target.value);
                        
                        if (isNaN(val) || e.target.value === '') {
                            form.handleChange('defaultCredits', '0.00');
                        } else {
                            form.handleChange('defaultCredits', val.toFixed(2));
                        }
                    }}
                    error={form.errors.defaultCredits?.[0]}
                />
            </div>
        </ModalForm>
    );
}