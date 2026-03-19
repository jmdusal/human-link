import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import ModalForm from '@/components/modals/ModalForm';
import Input from '@/components/Input';
import type { Role, Permission } from '@/types/models';
import api from '@/api/axios';
import { API_ROUTES } from '@/constants';

interface RoleFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (roleData: Role) => void;
    onError: (error: any) => void;
    selectedRole: Role | null;
}

export default function RoleForm({ isOpen, onClose, onSuccess, onError, selectedRole }: RoleFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
    const [formData, setFormData] = useState({ 
        name: '',
        permissions: [] as string[]
    });
    
    const groupedPermissions = Object.entries(availablePermissions.reduce((access, permission) => {
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
        perms.sort((a, b) => a.name.localeCompare(b.name))
    ]) as [string, Permission[]][];
    
    useEffect(() => {
        if (isOpen) {
            api.get(API_ROUTES.PERMISSIONS.LIST)
                .then(res => setAvailablePermissions(res.data.data))
                .catch(() => toast.error("Failed to load permissions"));
                // .catch(err => toast.error("Failed to load permissions"));
        }
    }, [isOpen]);

    useEffect(() => {
        if (selectedRole && isOpen) {
            setFormData({
                name: selectedRole.name,
                permissions: selectedRole.permissions?.map(p => p.name) || [],
            });
        } else if (!selectedRole && isOpen) {
            setFormData({ name: '', permissions: [] });
        }
    }, [selectedRole, isOpen]);
    
    const handlePermissionChange = (permissionName: string) => {
        setFormData(prev => {
            const isSelected = prev.permissions.includes(permissionName);
            return {
                ...prev,
                permissions: isSelected 
                    ? prev.permissions.filter(p => p !== permissionName)
                    : [...prev.permissions, permissionName]
            };
        });
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const saveRequest = selectedRole
            ? api.put(API_ROUTES.ROLES.UPDATE(selectedRole.id), formData)
            : api.post(API_ROUTES.ROLES.STORE, formData);

        setIsSubmitting(true);

        toast.promise(saveRequest, {
            loading: 'Processing request...',
            success: (res) => {
                onSuccess(res.data.data);
                onClose();
                return `Role ${selectedRole ? 'updated' : 'created'} successfully!`;
            },
            error: (err) => {
                onError(err);
                return err?.response?.data?.message || 'Failed to save role.';
            }
        }).finally(() => setIsSubmitting(false));
    };
    
    return (
        <ModalForm
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={handleSubmit}
            title={selectedRole ? "Edit Role" : "Create New Role"}
            description={selectedRole ? "MODIFY EXISTING CREDENTIALS" : "SETUP A NEW OPERATOR"}
            isUpdate={!!selectedRole}
            loading={isSubmitting}
        >
            <div className="col-span-1 md:col-span-2 flex flex-col gap-5 py-2">
                <Input
                    label="Name"
                    placeholder="Enter name"
                    value={formData.name}
                    onChange={(e) => setFormData({ 
                        ...formData,
                        name:
                        e.target.value
                    })}
                />

                <div className="space-y-6 text-left col-span-1 md:col-span-2"> 
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">
                        Access Permissions
                    </label>
                    
                    <div className="space-y-10"> 
                        {groupedPermissions.map(([category, permissions]) => (
                            <div key={category} className="group">
                                <div className="flex items-center gap-3 mb-6">
                                    <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-md">
                                        {category}
                                    </h4>
                                    <div className="h-[1px] flex-1 bg-slate-100 group-hover:bg-blue-100 transition-colors"></div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                    {permissions.map((permission) => {
                                        const isSelected = formData.permissions.includes(permission.name);
                                        const actionLabel = permission.name.split('-').pop() || permission.name;

                                        return (
                                            <label 
                                                key={permission.id} 
                                                className={`
                                                    flex items-center justify-center px-2 py-3 rounded-xl border text-center transition-all cursor-pointer select-none
                                                    ${isSelected 
                                                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100 scale-[1.02]' 
                                                        : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300 hover:bg-slate-50'
                                                    }
                                                `}
                                            >
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={isSelected}
                                                    onChange={() => handlePermissionChange(permission.name)}
                                                />
                                                <span className="text-[10px] font-black uppercase tracking-tighter">
                                                    {actionLabel}
                                                </span>
                                            </label>
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