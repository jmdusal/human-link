import React, { useEffect, useMemo } from 'react';
import ModalForm from '@/components/modals/ModalForm';
import Input from '@/components/ui/Input';
import FormLabel from '@/components/ui/FormLabel';
import Checkbox from '@/components/ui/Checkbox';
import type { Role, RoleFormData, Permission } from '@/types';
import { RoleService } from '@/services/RoleService';
import { usePermissions } from '@/hooks/use-permissions';
import { INITIAL_ROLE_FORM_STATE, formatRoleFormData } from '@/utils/roleUtils';
import { useForm } from '@/hooks/use-form';
import { Check } from 'lucide-react';

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
                
                {/* <div className="space-y-8 text-left col-span-1 md:col-span-2">
                    <div>
                        <FormLabel>Access Permissions</FormLabel>
                        <p className="text-[11px] text-slate-400 mt-1">
                            Define specific capabilities for this role by category.
                        </p>
                    </div>
                    
                    <div className="space-y-8"> 
                        {groupedPermissions.map(([category, permissions]) => (
                            <div key={category} className="group">
                                
                                <div className="flex items-center gap-4 mb-4">
                                    <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
                                        {category}
                                    </h4>
                                    <div className="h-[1px] flex-1 bg-slate-100 group-hover:bg-slate-200 transition-colors" />
                                </div>

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
                </div> */}
                
                <div className="space-y-6 text-left col-span-1 md:col-span-2">
                    <div className="flex items-end justify-between px-1">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Access Permissions</h3>
                            <p className="text-[11px] text-slate-400 mt-0.5">Configure granular access for this role.</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button 
                                type="button"
                                onClick={() => {
                                    groupedPermissions.forEach(([_, perms]) => {
                                        perms.forEach(p => {
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
                                    [...form.formData.permissions].forEach(permName => {
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
                            <div className="col-span-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resource</div>
                            <div className="col-span-6 flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <span className="w-12 text-center">View</span>
                                <span className="w-12 text-center">Create</span>
                                <span className="w-12 text-center">Edit</span>
                                <span className="w-12 text-center">Delete</span>
                            </div>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {groupedPermissions.map(([category, permissions]) => (
                                <div key={category} className="grid grid-cols-12 px-5 py-4 items-center hover:bg-slate-50/30 transition-colors group">
                                    <div className="col-span-6 pr-4">
                                        <h4 className="text-sm font-semibold text-slate-800 capitalize tracking-tight">{category.replace(/_/g, ' ')}</h4>

                                        <div className="flex gap-3 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    permissions.forEach(p => {
                                                        if (!form.formData.permissions.includes(p.name)) {
                                                            handlePermissionChange(p.name);
                                                        }
                                                    });
                                                }}
                                                className="text-[9px] font-bold text-blue-600 hover:underline uppercase tracking-tighter"
                                            >
                                                Select
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    permissions.forEach(p => {
                                                        if (form.formData.permissions.includes(p.name)) {
                                                            handlePermissionChange(p.name);
                                                        }
                                                    });
                                                }}
                                                className="text-[9px] font-bold text-slate-400 hover:text-red-500 hover:underline uppercase tracking-tighter"
                                            >
                                                Clear
                                            </button>
                                        </div>
                                    </div>

                                    <div className="col-span-6 flex justify-between">
                                        {['view', 'create', 'edit', 'delete'].map(action => {
                                            const perm = permissions.find(p => p.name.endsWith(action));
                                            const isSelected = perm ? form.formData.permissions.includes(perm.name) : false;

                                            return (
                                                <div key={action} className="w-12 flex justify-center">
                                                    {perm ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => handlePermissionChange(perm.name)}
                                                            className={`
                                                                w-5 h-5 rounded flex items-center justify-center transition-all border
                                                                ${isSelected 
                                                                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-100' 
                                                                    : 'bg-white border-slate-200 hover:border-slate-400 text-transparent'
                                                                }
                                                            `}
                                                        >
                                                            <Check size={12} strokeWidth={4} className={isSelected ? 'scale-100' : 'scale-0'} />
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