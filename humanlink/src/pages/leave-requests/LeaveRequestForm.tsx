import React, { useEffect, useState } from 'react';
import ModalForm from '@/components/modals/ModalForm';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import DateInput from '@/components/ui/DateInput';
import type { LeaveRequest, LeaveRequestFormData } from '@/types/LeaveRequest';
import type { LeavePolicy } from '@/types';
import { LeaveRequestService } from '@/services/LeaveRequestService';
import { formatLeaveRequestFormData, HALF_DAY_OPTIONS, INITIAL_LEAVE_REQUEST_FORM_STATE } from '@/utils/leaveRequestUtils';
import { useForm } from '@/hooks/use-form';

interface LeaveRequestFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (requestData: LeaveRequest) => void;
    selectedLeaveRequest: LeaveRequest | null;
}

export default function LeaveRequestForm({
    isOpen,
    onClose,
    onSuccess,
    selectedLeaveRequest,
}: LeaveRequestFormProps) {
    const form = useForm<LeaveRequestFormData>(INITIAL_LEAVE_REQUEST_FORM_STATE);
    const [policyOptions, setPolicyOptions] = useState<{ value: string; label: string }[]>([]);

    const onSubmit = (e: React.FormEvent) => {
        form.handleSubmit(
            e,
            () => LeaveRequestService.saveLeaveRequest(form.formData, selectedLeaveRequest?.id),
            (data) => {
                onSuccess(data);
                onClose();
            },
            'Leave request',
            !!selectedLeaveRequest
        );
    };

    useEffect(() => {
        const state = selectedLeaveRequest
            ? formatLeaveRequestFormData(selectedLeaveRequest)
            : INITIAL_LEAVE_REQUEST_FORM_STATE;

        form.setFormData(state);
    }, [selectedLeaveRequest, form.setFormData]);

    useEffect(() => {
        if (!isOpen) return;

        LeaveRequestService.getPolicyOptions()
            .then((policies: LeavePolicy[]) => {
                setPolicyOptions(
                    policies.map((policy) => ({
                        value: String(policy.id),
                        label: policy.name,
                    }))
                );
            })
            .catch(() => setPolicyOptions([]));
    }, [isOpen]);

    return (
        <ModalForm
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={onSubmit}
            title={selectedLeaveRequest ? 'Edit Leave Request' : 'Request Leave'}
            description={selectedLeaveRequest ? 'UPDATE PENDING REQUEST' : 'SUBMIT A NEW LEAVE REQUEST'}
            isUpdate={!!selectedLeaveRequest}
            loading={form.isSubmitting}
        >
            <div className="col-span-1 md:col-span-2 flex flex-col gap-5 py-2">
                <Select
                    label="Leave Policy"
                    options={policyOptions}
                    value={form.formData.leavePolicyId}
                    onChange={(val) => form.setFormData({ ...form.formData, leavePolicyId: val })}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DateInput
                        label="Start Date"
                        value={form.formData.startDate}
                        onChange={(date: Date | null) => {
                            if (!date) return;
                            const dateString = date.toISOString().split('T')[0];
                            form.setFormData((prev) => ({
                                ...prev,
                                startDate: dateString,
                                endDate: prev.endDate < dateString ? dateString : prev.endDate,
                            }));
                        }}
                    />
                    <DateInput
                        label="End Date"
                        value={form.formData.endDate}
                        onChange={(date: Date | null) => {
                            if (!date) return;
                            const dateString = date.toISOString().split('T')[0];
                            form.setFormData((prev) => ({ ...prev, endDate: dateString }));
                        }}
                    />
                </div>

                <Select
                    label="Day Type"
                    options={HALF_DAY_OPTIONS}
                    value={form.formData.halfDayType}
                    onChange={(val) => form.setFormData({
                        ...form.formData,
                        halfDayType: val as LeaveRequestFormData['halfDayType'],
                    })}
                />

                <Input
                    label="Reason"
                    placeholder="Optional reason for leave"
                    value={form.formData.reason}
                    onChange={(e) => form.handleChange('reason', e.target.value)}
                />
            </div>
        </ModalForm>
    );
}
