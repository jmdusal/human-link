import React, { useEffect, useMemo } from 'react';
import ModalForm from '@/components/modals/ModalForm';
import Input from '@/components/Input';
import FormLabel from '@/components/FormLabel';
import Checkbox from '@/components/Checkbox';
import type { Role, RoleFormData, Permission } from '@/types/models';
import { RoleService } from '@/services/RoleService';
import { usePermissions } from '@/hooks/usePermissions';
import { INITIAL_ROLE_FORM_STATE, formatRoleFormData } from '@/utils/roleUtils';
import { useForm } from '@/hooks/useForm';

interface RoleFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (roleData: Role) => void;
    onError: (error: any) => void;
    selectedRole: Role | null;
}

export default function RoleForm({ isOpen, onClose, onSuccess, selectedRole }: RoleFormProps) {
    const { permissions } = usePermissions(isOpen);
    const form = useForm<RoleFormData>(INITIAL_ROLE_FORM_STATE);
    
    const onSubmit = (e: React.FormEvent) => {
        form.handleSubmit(e, () => RoleService.saveRole(form.formData, selectedRole?.id),
            (data) => { 
                onSuccess(data); 
                onClose();
            },
            "Role",
            !!selectedRole
        );
    };
    
    const groupedPermissions = useMemo(() => {
        return Object.entries((permissions || []).reduce((access, permission) => {
            const parts = permission.name.split('-');
            const category = parts.slice(0, -1).join('-');
            
            if (!access[category]) access[category] = [];
            access[category].push(permission);
            return access;
        }, {} as Record<string, Permission[]>))
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([category, perms]) => [
            category,
            perms.sort((a, b) => a.name.localeCompare(b.name))
        ]) as [string, Permission[]][];
    }, [permissions]);
    
    const handlePermissionChange = (permissionName: string) => {
        form.setFormData(prev => {
            const isSelected = prev.permissions.includes(permissionName);
            return {
                ...prev,
                permissions: isSelected 
                    ? prev.permissions.filter(p => p !== permissionName)
                    : [...prev.permissions, permissionName]
            };
        });
    };

    useEffect(() => {
        const state = selectedRole
            ? formatRoleFormData(selectedRole) 
            : INITIAL_ROLE_FORM_STATE;

        form.setFormData(state);
    }, [selectedRole, form.setFormData]);
    
    return (
        <ModalForm
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={onSubmit}
            title={selectedRole ? "Edit Role" : "Create New Role"}
            description={selectedRole ? "MODIFY EXISTING CREDENTIALS" : "SETUP A NEW OPERATOR"}
            isUpdate={!!selectedRole}
            loading={form.isSubmitting}
        >
            <div className="col-span-1 md:col-span-2 flex flex-col gap-5 py-2">
                <Input
                    label="Name"
                    placeholder="Enter name"
                    value={form.formData.name}
                    onChange={(e) => form.handleChange('name', e.target.value)}
                    error={form.errors.name?.[0]}
                />
                
                <div className="space-y-8 text-left col-span-1 md:col-span-2">
                    <div>
                        <FormLabel>Access Permissions</FormLabel>
                        <p className="text-[11px] text-slate-400 mt-1">
                            Define specific capabilities for this role by category.
                        </p>
                    </div>
                    
                    <div className="space-y-8"> 
                        {groupedPermissions.map(([category, permissions]) => (
                            <div key={category} className="group">
                                {/* Category Header */}
                                <div className="flex items-center gap-4 mb-4">
                                    <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
                                        {category}
                                    </h4>
                                    <div className="h-[1px] flex-1 bg-slate-100 group-hover:bg-slate-200 transition-colors" />
                                </div>

                                {/* Permissions Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {permissions.map((permission) => {
                                        const isSelected = form.formData.permissions.includes(permission.name);
                                        const actionLabel = permission.name.split('-').pop() || permission.name;

                                        return (
                                            <div 
                                                key={permission.id}
                                                onClick={() => handlePermissionChange(permission.name)}
                                                className={`
                                                    flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer select-none
                                                    ${isSelected 
                                                        ? 'bg-blue-50/50 border-blue-200 ring-1 ring-blue-500/10' 
                                                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                                    }
                                                `}
                                            >
                                                <Checkbox 
                                                    checked={isSelected}
                                                    onChange={() => {}}
                                                    className="scale-90"
                                                />
                                                <span className={`
                                                    text-xs font-medium capitalize tracking-tight
                                                    ${isSelected ? 'text-blue-700' : 'text-slate-600'}
                                                `}>
                                                    {actionLabel}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </ModalForm>
    );
}