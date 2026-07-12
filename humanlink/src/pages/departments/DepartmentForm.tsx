import React, { useEffect } from 'react';
import ModalForm from '@/components/modals/ModalForm';
import Input from '@/components/ui/Input';
import Switch from '@/components/ui/Switch';
import type { Department, DepartmentFormData } from '@/types';
import { DepartmentService } from '@/services/DepartmentService';
import { INITIAL_DEPARTMENT_FORM_STATE, formatDepartmentFormData } from '@/utils/departmentUtils';
import { useForm } from '@/hooks/use-form';
import { formatSlug } from '@/utils/formatUtils';

interface DepartmentFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (department: Department) => void;
    onError: (error: unknown) => void;
    selectedDepartment: Department | null;
}

export default function DepartmentForm({
    isOpen,
    onClose,
    onSuccess,
    selectedDepartment,
}: DepartmentFormProps) {
    const form = useForm<DepartmentFormData>(INITIAL_DEPARTMENT_FORM_STATE);

    const onSubmit = (e: React.FormEvent) => {
        form.handleSubmit(
            e,
            () => DepartmentService.saveDepartment(form.formData, selectedDepartment?.id),
            (data) => {
                onSuccess(data);
                onClose();
            },
            'Department',
            !selectedDepartment
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
        const state = selectedDepartment
            ? formatDepartmentFormData(selectedDepartment)
            : INITIAL_DEPARTMENT_FORM_STATE;

        form.setFormData(state);
    }, [selectedDepartment, form.setFormData]);

    return (
        <ModalForm
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={onSubmit}
            title={selectedDepartment ? 'Edit Department' : 'Create Department'}
            description={selectedDepartment ? 'UPDATE DEPARTMENT DETAILS' : 'ADD A NEW DEPARTMENT'}
            isUpdate={!!selectedDepartment}
            loading={form.isSubmitting}
        >
            <div className="col-span-1 md:col-span-2 flex flex-col gap-5 py-2">
                <Input
                    label="Name"
                    placeholder="e.g. Engineering"
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
                    description="Inactive departments stay hidden from new user assignments."
                    checked={form.formData.isActive}
                    onChange={(val) => form.handleChange('isActive', val)}
                />
            </div>
        </ModalForm>
    );
}
