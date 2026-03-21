import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import ModalForm from '@/components/modals/ModalForm';
import Input from '@/components/Input';
import Select from '@/components/Select';
import Toggle from '@/components/Toggle';
import DateInput from '@/components/DateInput';
import Checkbox from '@/components/Checkbox';
import FormLabel from '@/components/FormLabel';
import api from '@/api/axios';
import type { User } from '@/types/models';
import { API_ROUTES, USER_STATUS_OPTIONS } from '@/constants';
import { createEmptySchedules, formatUserFormData, formatDateForInput, INITIAL_FORM_STATE, DAYS_NAME } from '@/utils/userUtils'
import { camelizeKeys } from '@/utils/formatUtils';

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
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const today = new Date().toISOString().split('T')[0];
    
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
        effectiveDate: today,
        isActive: true,
        weeklyData: createEmptySchedules(today),
        scheduleStartDate: today
    });
    
    const handleChange = (field: keyof typeof formData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        if (errors[field as string]) {
            // console.log(`clearing error for [${field}]:`, errors[field as string]);
            const { [field as string]: _, ...rest } = errors;
            setErrors(rest);
        }
    };
    
    const handleMonthlyChange = (val: string) => {
        const monthly = parseFloat(val) || 0;
        const daily = (monthly / 22).toFixed(2);
        const hourly = (parseFloat(daily) / 8).toFixed(2); 
        
        setFormData(prev => ({
            ...prev,
            monthlyRate: val,
            dailyRate: daily,
            hourlyRate: hourly
        }));
        
        if (errors.monthlyRate || errors.dailyRate || errors.hourlyRate) {
            const { monthlyRate, dailyRate, hourlyRate, ...rest } = errors;
            setErrors(rest);
        }
    };
    
    const handleScheduleChange = (index: number, field: string, value: any) => {
        const updated = [...formData.weeklyData];
        updated[index] = { ...updated[index], [field]: value };
        setFormData(prev => ({ ...prev, weeklyData: updated }));
    };
    
    const handleGlobalStartDateChange = (date: string) => {
        const updatedSchedules = formData.weeklyData.map(s => ({ 
            ...s, 
            startDate: date
        }));

        setFormData(prev => ({ 
            ...prev, 
            scheduleStartDate: date, 
            schedules: updatedSchedules 
        }));
    };
    
    const resetRates = () => handleMonthlyChange(formData.monthlyRate);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setIsSubmitting(true);

        try {
            const { scheduleStartDate, weeklyData, ...rest } = formData;
            
            const payload = {
                ...rest,
                startDate: scheduleStartDate,
                weeklyData: weeklyData.map(({ startDate, ...day }) => day)
            };
            
            if (selectedUser && !payload.password) {
                delete (payload as any).password;
            }

            const res = selectedUser
                ? await api.put(API_ROUTES.USERS.UPDATE(selectedUser.id), payload)
                : await api.post(API_ROUTES.USERS.STORE, payload);
                
                
            // setIsSubmitting(true);
            toast.success(`User ${selectedUser ? 'updated' : 'created'} successfully!`);
            onSuccess(res.data.data);
            onClose();
        } catch (err: any) {
            if (err.response?.status === 422) {
                const validationErrors = camelizeKeys(err.response.data.errors);
                console.log("error Object:", validationErrors);
                // console.log("fields with errors:", Object.keys(err.response.data.errors));
                setErrors(validationErrors);
            }
            onError(err);
            // toast.error(err?.response?.data?.message || 'Failed to save user.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    useEffect(() => {
        if (selectedUser && isOpen) {
            setFormData(formatUserFormData(selectedUser, today));
            console.log('this user', selectedUser)
        } else if (!selectedUser && isOpen) {
            setFormData(INITIAL_FORM_STATE(today));
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
            size="5xl"
        >
            <div className="col-span-1 md:col-span-2 flex flex-col gap-5 py-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Name"
                        placeholder="Enter full name"
                        value={formData.name}
                        // onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        onChange={(e) => handleChange('name', e.target.value)}
                        error={errors.name?.[0]}
                    />
                    <Input
                        label="Email Address"
                        type="email"
                        placeholder="Enter email address"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        error={errors.email?.[0]}
                    />
                    <Input
                        label="Password"
                        type="password"
                        placeholder="••••••••"
                        disabled={!!selectedUser}
                        helperText={selectedUser ? "(Leave blank to keep current)" : undefined}
                        value={formData.password}
                        onChange={(e) => handleChange('password', e.target.value)}
                        error={errors.password?.[0]}
                    />
                    <Select
                        label="Role"
                        options={roleOptions}
                        value={formData.role}
                        onChange={(val) => setFormData({ ...formData, role: val })}
                    /> 
                </div>
                
                <Toggle 
                    label="Account Status"
                    value={formData.status}
                    options={USER_STATUS_OPTIONS}
                    onChange={(newValue) => setFormData({ ...formData, status: newValue })}
                />
                
                <div className="h-px bg-slate-100 my-2" />
                <h3 className="text-[11px] font-black text-blue-500 uppercase tracking-widest">Rate Information</h3>
                
                {/* rates grid */}
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
                                const formatted = val.toFixed(2);
                                handleMonthlyChange(formatted); 
                            }
                        }}
                        error={errors.monthlyRate?.[0]}
                    />
                    <Input
                        label="Daily Rate"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.dailyRate}
                        onClick={resetRates}
                        // onChange={(e) => setFormData({ ...formData, dailyRate: e.target.value })}
                        onChange={(e) => handleChange('dailyRate', e.target.value)}
                        error={errors.dailyRate?.[0]}
                    />
                    <Input
                        label="Hourly Rate"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.hourlyRate}
                        onClick={resetRates}
                        // onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                        onChange={(e) => handleChange('hourlyRate', e.target.value)}
                        error={errors.hourlyRate?.[0]}
                    />
                </div>
                
                <div className="h-px bg-slate-100 my-2" />
                <div className="flex justify-between items-end mb-2">
                    <h3 className="text-[11px] font-black text-blue-500 uppercase tracking-widest pb-1">
                        Weekly Schedule
                    </h3>
                    <div className="w-64"> 
                        <DateInput 
                            label="Start Date"
                            value={formData.scheduleStartDate}
                            onChange={(date: Date | null) => {
                                if (date) {
                                    const dateString = date.toISOString().split('T')[0];
                                    handleGlobalStartDateChange(dateString); 
                                }
                            }}
                        />
                    </div>
                </div>
                
                <div className="flex flex-col border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
                    <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 border-b border-slate-100 bg-slate-50/50">
                        <div className="col-span-2"><FormLabel>Day</FormLabel></div>
                        <div className="col-span-4"><FormLabel>Shift In</FormLabel></div>
                        <div className="col-span-4"><FormLabel>Shift Out</FormLabel></div>
                        <div className="col-span-2 text-center"><FormLabel>Rest Day</FormLabel></div>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {formData.weeklyData.map((sched, index) => {
                            const isRest = sched.isRestDay;
                            
                            return (
                                <div 
                                    key={index} 
                                    className={`
                                        grid grid-cols-1 md:grid-cols-12 gap-4 items-center px-4 py-3 transition-colors
                                        ${isRest ? 'bg-slate-50/50' : 'bg-white hover:bg-slate-50/30'}
                                    `}
                                >
                                    <div className="col-span-2 flex flex-col">
                                        <span className={`text-sm font-semibold ${isRest ? 'text-slate-400' : 'text-slate-700'}`}>
                                            {DAYS_NAME[sched.dayOfWeek]}
                                        </span>
                                    </div>
                                    <div className="col-span-4">
                                        <Input
                                            type="time" 
                                            disabled={isRest}
                                            value={isRest ? "" : sched.shiftStart} 
                                            onChange={(e) => handleScheduleChange(index, 'shiftStart', e.target.value)}
                                            className={isRest ? "opacity-50" : ""}
                                            // empty string to keep spacing
                                            label=""
                                        />
                                    </div>
                                    <div className="col-span-4">
                                        <Input 
                                            type="time" 
                                            disabled={isRest}
                                            value={isRest ? "" : sched.shiftEnd} 
                                            onChange={(e) => handleScheduleChange(index, 'shiftEnd', e.target.value)}
                                            className={isRest ? "opacity-50" : ""}
                                            label=""
                                        />
                                    </div>
                                    <div className="col-span-2 flex justify-center">
                                        <Checkbox 
                                            checked={isRest}
                                            onChange={(e) => handleScheduleChange(index, 'isRestDay', e.target.checked)}
                                            className="scale-90" 
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </ModalForm>
    );
}