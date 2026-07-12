import React, { useEffect, useMemo } from 'react';
import { Check } from 'lucide-react';
import ModalForm from '@/components/modals/ModalForm';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { useForm } from '@/hooks/use-form';
import { usePermissions } from '@/hooks/use-permissions';
import { UserTypeService } from '@/services/UserTypeService';
import type { Permission } from '@/types';
import type { AccessScope, UserTypeFormData, UserTypeRecord } from '@/types/UserTypeRecord';
import {
    ACCESS_SCOPE_OPTIONS,
    INITIAL_USER_TYPE_FORM_STATE,
    formatUserTypeFormData,
} from '@/utils/userTypeUtils';

interface UserTypeFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (userType: UserTypeRecord) => void;
    onError: (error: unknown) => void;
    selectedUserType: UserTypeRecord | null;
}

export default function UserTypeForm({
    isOpen,
    onClose,
    onSuccess,
    selectedUserType,
}: UserTypeFormProps) {
    const { permissions } = usePermissions(isOpen);
    const form = useForm<UserTypeFormData>(INITIAL_USER_TYPE_FORM_STATE);

    const onSubmit = (e: React.FormEvent) => {
        form.handleSubmit(
            e,
            () => UserTypeService.saveUserType(form.formData, selectedUserType?.id),
            (data) => {
                onSuccess(data);
                onClose();
            },
            'User type',
            !!selectedUserType
        );
    };

    const groupedPermissions = useMemo(() => {
        return Object.entries(
            (permissions || []).reduce((access, permission) => {
                const parts = permission.name.split('-');
                const category = parts.slice(0, -1).join('-');

                if (!access[category]) access[category] = [];
                access[category].push(permission);
                return access;
            }, {} as Record<string, Permission[]>)
        )
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([category, perms]) => [
                category,
                perms.sort((a, b) => a.name.localeCompare(b.name)),
            ]) as [string, Permission[]][];
    }, [permissions]);

    const handlePermissionChange = (permissionName: string) => {
        form.setFormData((prev) => {
            const isSelected = prev.permissions.includes(permissionName);
            return {
                ...prev,
                permissions: isSelected
                    ? prev.permissions.filter((p) => p !== permissionName)
                    : [...prev.permissions, permissionName],
            };
        });
    };

    useEffect(() => {
        const state = selectedUserType
            ? formatUserTypeFormData(selectedUserType)
            : INITIAL_USER_TYPE_FORM_STATE;

        form.setFormData(state);
    }, [selectedUserType, form.setFormData]);

    return (
        <ModalForm
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={onSubmit}
            title={selectedUserType ? 'Edit User Type' : 'Create User Type'}
            description={selectedUserType ? 'UPDATE ACCESS PACK' : 'DEFINE A NEW ACCESS PACK'}
            isUpdate={!!selectedUserType}
            loading={form.isSubmitting}
        >
            <div className="col-span-1 md:col-span-2 flex flex-col gap-5 py-2">
                <Input
                    label="Name"
                    placeholder="e.g. People Ops"
                    value={form.formData.name}
                    onChange={(e) => form.handleChange('name', e.target.value)}
                    error={form.errors.name?.[0]}
                />

                <Select
                    label="Data access scope"
                    options={ACCESS_SCOPE_OPTIONS.map((option) => ({
                        value: option.value,
                        label: `${option.label} — ${option.description}`,
                    }))}
                    value={form.formData.accessScope}
                    onChange={(val) =>
                        form.setFormData({
                            ...form.formData,
                            accessScope: val as AccessScope,
                        })
                    }
                    error={form.errors.access_scope?.[0] || form.errors.accessScope?.[0]}
                />

                <div className="space-y-6 text-left col-span-1 md:col-span-2">
                    <div className="flex items-end justify-between px-1">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                                Access Permissions
                            </h3>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                Check the modules this user type can use.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    groupedPermissions.forEach(([, perms]) => {
                                        perms.forEach((p) => {
                                            if (!form.formData.permissions.includes(p.name)) {
                                                handlePermissionChange(p.name);
                                            }
                                        });
                                    });
                                }}
                                className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-widest transition-colors"
                            >
                                Select All
                            </button>
                            <div className="w-[1px] h-3 bg-slate-200" />
                            <button
                                type="button"
                                onClick={() => {
                                    [...form.formData.permissions].forEach((permName) => {
                                        handlePermissionChange(permName);
                                    });
                                }}
                                className="text-[10px] font-bold text-slate-400 hover:text-red-500 uppercase tracking-widest transition-colors"
                            >
                                Clear All
                            </button>
                        </div>
                    </div>

                    <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
                        <div className="grid grid-cols-12 bg-slate-50/50 border-b border-slate-100 px-5 py-3">
                            <div className="col-span-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Resource
                            </div>
                            <div className="col-span-6 flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <span className="w-12 text-center">View</span>
                                <span className="w-12 text-center">Create</span>
                                <span className="w-12 text-center">Edit</span>
                                <span className="w-12 text-center">Delete</span>
                            </div>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {groupedPermissions.map(([category, categoryPermissions]) => (
                                <div
                                    key={category}
                                    className="grid grid-cols-12 px-5 py-4 items-center hover:bg-slate-50/30 transition-colors group"
                                >
                                    <div className="col-span-6 pr-4">
                                        <h4 className="text-sm font-semibold text-slate-800 capitalize tracking-tight">
                                            {category.replace(/_/g, ' ')}
                                        </h4>
                                    </div>

                                    <div className="col-span-6 flex justify-between">
                                        {['view', 'create', 'edit', 'delete'].map((action) => {
                                            const perm = categoryPermissions.find((p) =>
                                                p.name.endsWith(action)
                                            );
                                            const isSelected = perm
                                                ? form.formData.permissions.includes(perm.name)
                                                : false;

                                            return (
                                                <div key={action} className="w-12 flex justify-center">
                                                    {perm ? (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handlePermissionChange(perm.name)
                                                            }
                                                            className={`
                                                                w-5 h-5 rounded flex items-center justify-center transition-all border
                                                                ${
                                                                    isSelected
                                                                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-100'
                                                                        : 'bg-white border-slate-200 hover:border-slate-400 text-transparent'
                                                                }
                                                            `}
                                                        >
                                                            <Check
                                                                size={12}
                                                                strokeWidth={4}
                                                                className={
                                                                    isSelected ? 'scale-100' : 'scale-0'
                                                                }
                                                            />
                                                        </button>
                                                    ) : (
                                                        <div className="w-5 h-5 rounded bg-slate-50/50 border border-transparent" />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </ModalForm>
    );
}
