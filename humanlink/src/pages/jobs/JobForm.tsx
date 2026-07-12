import React, { useEffect, useMemo } from 'react';
import ModalForm from '@/components/modals/ModalForm';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Switch from '@/components/ui/Switch';
import type { Position, PositionFormData } from '@/types';
import { PositionService } from '@/services/PositionService';
import { INITIAL_POSITION_FORM_STATE, formatPositionFormData } from '@/utils/positionUtils';
import { useForm } from '@/hooks/use-form';
import { useDepartments } from '@/hooks/use-departments';
import { formatSlug } from '@/utils/formatUtils';

interface PositionFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (position: Position) => void;
    onError: (error: unknown) => void;
    selectedPosition: Position | null;
}

export default function PositionForm({
    isOpen,
    onClose,
    onSuccess,
    selectedPosition,
}: PositionFormProps) {
    const form = useForm<PositionFormData>(INITIAL_POSITION_FORM_STATE);
    const { departments } = useDepartments(isOpen);

    const departmentOptions = useMemo(
        () =>
            departments
                .filter((department) => department.isActive || String(department.id) === form.formData.departmentId)
                .map((department) => ({
                    value: String(department.id),
                    label: department.name,
                })),
        [departments, form.formData.departmentId]
    );

    const onSubmit = (e: React.FormEvent) => {
        form.handleSubmit(
            e,
            () => PositionService.savePosition(form.formData, selectedPosition?.id),
            (data) => {
                onSuccess(data);
                onClose();
            },
            'Job',
            !selectedPosition
        );
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;

        form.setFormData((prev) => ({
            ...prev,
            name: newName,
            slug: formatSlug(newName),
        }));

        if (form.errors.name || form.errors.slug) {
            const { name, ...rest } = form.errors;
            form.setErrors(rest);
        }
    };

    useEffect(() => {
        const state = selectedPosition
            ? formatPositionFormData(selectedPosition)
            : INITIAL_POSITION_FORM_STATE;

        form.setFormData(state);
    }, [selectedPosition, form.setFormData]);

    return (
        <ModalForm
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={onSubmit}
            title={selectedPosition ? 'Edit Job' : 'Create Job'}
            description={selectedPosition ? 'UPDATE JOB DETAILS' : 'ADD A NEW JOB UNDER A DEPARTMENT'}
            isUpdate={!!selectedPosition}
            loading={form.isSubmitting}
        >
            <div className="col-span-1 md:col-span-2 flex flex-col gap-5 py-2">
                <Select
                    label="Department"
                    options={departmentOptions}
                    value={form.formData.departmentId}
                    onChange={(val) => form.handleChange('departmentId', val)}
                    placeholder="Select department"
                />
                <Input
                    label="Job title"
                    placeholder="e.g. Software Engineer"
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
                <Switch
                    label="Active"
                    description="Inactive jobs stay hidden from new user assignments."
                    checked={form.formData.isActive}
                    onChange={(val) => form.handleChange('isActive', val)}
                />
            </div>
        </ModalForm>
    );
}
