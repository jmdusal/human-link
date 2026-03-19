import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import ModalForm from '@/components/modals/ModalForm';
import Input from '@/components/Input';
import Select from '@/components/Select';
import Toggle from '@/components/Toggle';
import api from '@/api/axios';
import type { User } from '@/types/models';
import { API_ROUTES, USER_STATUS_OPTIONS } from '@/constants';

interface UserFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (userData: User) => void;
    onError: (error: any) => void;
    selectedUser: User | null;
}

export default function UserForm({ isOpen, onClose, onSuccess, onError, selectedUser }: UserFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [roleOptions, setRoleOptions] = useState<{ value: string; label: string }[]>([]);
    const [formData, setFormData] = useState({ 
        name: '',
        email: '',
        password: '',
        role: 'user',
        status: 'active',
        monthlyRate: '',
        dailyRate: '',
        hourlyRate: '',
        allowanceMonthly: '0.00',
        effectiveDate: new Date().toISOString().split('T')[0],
        isActive: true
    });
    
    const handleMonthlyChange = (val: string) => {
        const monthly = parseFloat(val) || 0;
        const daily = (monthly / 22).toFixed(2);
        const hourly = (parseFloat(daily) / 8).toFixed(2); 

        setFormData({
            ...formData,
            monthlyRate: val,
            dailyRate: daily,
            hourlyRate: hourly
        });
    };
    
    const resetRates = () => handleMonthlyChange(formData.monthlyRate);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = { ...formData };
        
        if (selectedUser && !payload.password) {
            delete (payload as any).password;
        }

        console.log("PAYLOAD BEING SENT:", payload);
        
        const saveRequest = selectedUser
            ? api.put(API_ROUTES.USERS.UPDATE(selectedUser.id), payload)
            : api.post(API_ROUTES.USERS.STORE, payload);

        setIsSubmitting(true);

        toast.promise(saveRequest, {
            loading: 'Processing request...',
            success: (res) => {
                onSuccess(res.data.data);
                onClose();
                return `User ${selectedUser ? 'updated' : 'created'} successfully!`;
            },
            error: (err) => {
                onError(err);
                return err?.response?.data?.message || 'Failed to save user.';
            }
        }).finally(() => setIsSubmitting(false));
    };
    
    useEffect(() => {
        if (selectedUser && isOpen) {
            const currentRole = selectedUser.roles?.[0]?.name || 'user';
            
            setFormData({
                name: selectedUser.name,
                email: selectedUser.email,
                password: '',
                role: currentRole,
                status: selectedUser.status,
                // status: selectedUser.status?.toLowerCase() || 'active' 
                monthlyRate: selectedUser.rate?.monthlyRate 
                    ? Number(selectedUser.rate.monthlyRate).toFixed(2) 
                    : '',
                
                dailyRate: selectedUser.rate?.dailyRate || '',
                hourlyRate: selectedUser.rate?.hourlyRate || '',
                // allowance_monthly: selectedUser.rate?.allowance_monthly || '0.00',
                
                allowanceMonthly: selectedUser.rate?.allowanceMonthly 
                    ? Number(selectedUser.rate.allowanceMonthly).toFixed(2) 
                    : '0.00',
                effectiveDate: selectedUser.rate?.effectiveDate || new Date().toISOString().split('T')[0],
                isActive: selectedUser.rate?.isActive ?? true
                
            });
        } else if (!selectedUser && isOpen) {
            setFormData({ 
                name: '', email: '', password: '', role: 'user', status: 'active',
                monthlyRate: '', dailyRate: '', hourlyRate: '', allowanceMonthly: '0.00',
                effectiveDate: new Date().toISOString().split('T')[0], isActive: true
            });
        }
    }, [selectedUser, isOpen]);
    
    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const res = await api.get(API_ROUTES.ROLES.LIST);
                const options = res.data.data.map((role: any) => ({
                    value: role.name,
                    label: role.name.charAt(0).toUpperCase() + role.name.slice(1)
                }));
                setRoleOptions(options);
            } catch (err) {
                console.error("Failed to load roles", err);
            }
        };

        if (isOpen) fetchRoles();
    }, [isOpen]);

    return (
        <ModalForm
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={handleSubmit}
            title={selectedUser ? "Edit User Profile" : "Create New User"}
            description={selectedUser ? "MODIFY EXISTING CREDENTIALS" : "SETUP A NEW OPERATOR"}
            isUpdate={!!selectedUser}
            loading={isSubmitting}
        >
            <div className="col-span-1 md:col-span-2 flex flex-col gap-5 py-2">
                <Input
                    label="Name"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <Input
                    label="Email Address"
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <Input
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    disabled={!!selectedUser}
                    helperText={selectedUser ? "(Leave blank to keep current)" : undefined}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <Select
                    label="Role"
                    options={roleOptions}
                    value={formData.role}
                    onChange={(val) => setFormData({ ...formData, role: val })}
                />
                <Toggle 
                    label="Account Status"
                    value={formData.status}
                    options={USER_STATUS_OPTIONS}
                    onChange={(newValue) => setFormData({ ...formData, status: newValue })}
                />
                
                <div className="h-px bg-slate-100 my-2" />
                <h3 className="text-[11px] font-black text-blue-500 uppercase tracking-widest">Rate Information</h3>
                
                {/* User Rates Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                        label="Monthly Rate"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.monthlyRate}
                        onChange={(e) => handleMonthlyChange(e.target.value)}
                        onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val)) {
                                setFormData({ ...formData, monthlyRate: val.toFixed(2) });
                            }
                        }}
                    />

                    <Input
                        label="Daily Rate"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.dailyRate}
                        onClick={resetRates}
                        onChange={(e) => setFormData({ ...formData, dailyRate: e.target.value })}
                    />

                    <Input
                        label="Hourly Rate"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.hourlyRate}
                        onClick={resetRates}
                        onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                    />
                </div>
            </div>
        </ModalForm>
    );
}