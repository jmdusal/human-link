import React, { useEffect } from 'react';
import ModalForm from '@/components/modals/ModalForm';
import Input from '@/components/ui/Input';
import Toggle from '@/components/ui/Toggle';
import Switch from '@/components/ui/Switch';
import type { LeavePolicy, LeavePolicyFormData } from '@/types';
import { LeavePolicyService } from '@/services/LeavePolicyService';
import { INITIAL_LEAVE_POLICY_FORM_STATE, formatLeavePolicyFormData } from '@/utils/leavepolicyUtils';
import { useForm } from '@/hooks/use-form';
import { formatSlug } from '@/utils/formatUtils';

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
    
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        
        form.setFormData(prev => ({
            ...prev,
            name: newName,
            slug: formatSlug(newName)
        }));
        
        if (form.errors.name || form.errors.slug) {
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
                            
                        const formattedValue = isNaN(val) || e.target.value === '' 
                            ? '0.00' 
                            : val.toFixed(2);
                            
                        form.handleChange('defaultCredits', formattedValue);
                    }}
                    error={form.errors.defaultCredits?.[0]}
                />
                {form.formData.allowCarryOver && (
                    <Input
                        label="Max Days to Carry Over"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={form.formData.maxCarryOver}
                        onChange={(e) => form.handleChange('maxCarryOver', e.target.value)}
                        onFocus={(e) => {
                            if (form.formData.maxCarryOver === '0.00') {
                                form.handleChange('maxCarryOver', '');
                            } else {
                                e.target.select();
                            }
                        }}
                        onBlur={(e) => {
                            const val = parseFloat(e.target.value);
                                
                            const formattedValue = isNaN(val) || e.target.value === '' 
                                ? '0.00' 
                                : val.toFixed(2);
                            form.handleChange('maxCarryOver', formattedValue);
                        }}
                        error={form.errors.maxCarryOver?.[0]}
                    />
                )}
                <Switch
                    label="Policy Status" 
                    description="Enable or disable this leave policy across the system."
                    checked={form.formData.isActive} 
                    onChange={(val) => form.handleChange('isActive', val)} 
                />
                <Switch
                    label="Paid Leave" 
                    description="Determine if this leave type is deductible from payroll."
                    checked={form.formData.isPaid} 
                    onChange={(val) => form.handleChange('isPaid', val)} 
                />
                <Switch
                    label="Cashable" 
                    description="Allow unused credits to be converted to cash at the end of the year (e.g., SIL)."
                    checked={form.formData.isCashable} 
                    onChange={(val) => form.handleChange('isCashable', val)} 
                />
                <Switch
                    label="Allow Carry-over" 
                    description="Enable unused leave credits to be moved to the next year."
                    checked={form.formData.allowCarryOver} 
                    onChange={(val) => form.handleChange('allowCarryOver', val)} 
                />
                <Switch 
                    label="Requires Attachment"
                    description="Force users to upload documents (Medical Cert, Solo Parent ID, etc.)"
                    checked={form.formData.requiresAttachment} 
                    onChange={(val) => form.handleChange('requiresAttachment', val)} 
                />
            </div>
        </ModalForm>
    );
}