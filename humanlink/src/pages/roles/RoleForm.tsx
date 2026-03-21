import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import ModalForm from '@/components/modals/ModalForm';
import Input from '@/components/Input';
import FormLabel from '@/components/FormLabel';
import Checkbox from '@/components/Checkbox';
import type { Role, Permission } from '@/types/models';
import api from '@/api/axios';
import { API_ROUTES } from '@/constants';
import { camelizeKeys } from '@/utils/formatUtils';

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
    const [errors, setErrors] = useState<Record<string, string[]>>({});
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
    
    const handleChange = (field: keyof typeof formData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        if (errors[field as string]) {
            const { [field as string]: _, ...rest } = errors;
            setErrors(rest);
        }
    };
    
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
        setErrors({});
        setIsSubmitting(true);
        
        try {
            const res = selectedRole
            ? await api.put(API_ROUTES.ROLES.UPDATE(selectedRole.id), formData)
            : await api.post(API_ROUTES.ROLES.STORE, formData);
            
            toast.success(`Role ${selectedRole ? 'updated' : 'created'} successfully!`);
            onSuccess(res.data.data);
            onClose();
        } catch (err: any) {
            if (err.response?.status === 422) {
                const validationErrors = camelizeKeys(err.response.data.errors);
                console.log("error Object:", validationErrors);
                setErrors(validationErrors);
            }
            onError(err);
        } finally {
            setIsSubmitting(false);
        }
    };
    
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
    
    useEffect(() => {
        if (isOpen) {
            api.get(API_ROUTES.PERMISSIONS.LIST)
                .then(res => setAvailablePermissions(res.data.data))
                .catch(() => toast.error("Failed to load permissions"));
                // .catch(err => toast.error("Failed to load permissions"));
        }
    }, [isOpen]);
    
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
                    onChange={(e) => handleChange('name', e.target.value)}
                    error={errors.name?.[0]}
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
                                        const isSelected = formData.permissions.includes(permission.name);
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