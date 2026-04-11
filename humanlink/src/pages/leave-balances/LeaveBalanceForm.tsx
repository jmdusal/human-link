import React, { useEffect } from 'react';
import ModalForm from '@/components/modals/ModalForm';
import Input from '@/components/ui/Input';
import Toggle from '@/components/ui/Toggle';
import Switch from '@/components/ui/Switch';
import type { LeaveBalance, LeaveBalanceFormData } from '@/types';
import { LeaveBalanceService } from '@/services/LeaveBalanceService';
import { INITIAL_LEAVE_BALANCE_FORM_STATE, formatLeaveBalanceFormData } from '@/utils/leavebalanceUtils';
import { useForm } from '@/hooks/use-form';
import { formatSlug } from '@/utils/formatUtils';

interface LeaveBalanceFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (balanceData: LeaveBalance) => void;
    onError: (error: any) => void;
    selectedLeaveBalance: LeaveBalance | null;
}

export default function LeaveBalanceForm({ isOpen, onClose, onSuccess, onError, selectedLeaveBalance }: LeaveBalanceFormProps) {
    const form = useForm<LeaveBalanceFormData>(INITIAL_LEAVE_BALANCE_FORM_STATE);
    
    const onSubmit = (e: React.FormEvent) => {
        form.handleSubmit(e, () => LeaveBalanceService.saveBalance(form.formData, selectedLeaveBalance?.id),
            (data) => {
                onSuccess(data);
                onClose();
            },
            "Balance",
                !selectedLeaveBalance
        );
    };
    
    useEffect(() => {
        const state = selectedLeaveBalance
            ? formatLeaveBalanceFormData(selectedLeaveBalance) 
            : INITIAL_LEAVE_BALANCE_FORM_STATE;

        form.setFormData(state);
    }, [selectedLeaveBalance, form.setFormData]); 

    return (
        <ModalForm
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={onSubmit}
            title={selectedLeaveBalance ? "Edit Balance" : "Create New Balance"}
            description={selectedLeaveBalance ? "MODIFY EXISTING BALANCE" : "SETUP A NEW BALANCE"}
            isUpdate={!!selectedLeaveBalance}
            loading={form.isSubmitting}
        >
            <div className="col-span-1 md:col-span-2 flex flex-col gap-5 py-2">
                {/* <Input
                    label="Name"
                    placeholder="Enter name"
                    value={form.formData.name}
                    onChange={handleNameChange}
                    error={form.errors.name?.[0]}
                /> */}
            </div>
        </ModalForm>
    );
}