import React, { useEffect } from 'react';
import ModalForm from '@/components/modals/ModalForm';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Toggle from '@/components/ui/Toggle';
import DateInput from '@/components/ui/DateInput';
import Checkbox from '@/components/ui/Checkbox';
import FormLabel from '@/components/ui/FormLabel';
import type { User, UserFormData } from '@/types';
import { USER_STATUS_OPTIONS } from '@/constants';
import { formatUserFormData, INITIAL_USER_FORM_STATE, DAYS_NAME } from '@/utils/userUtils';
import { UserService } from '@/services/UserService';
import { useRoles } from '@/hooks/use-roles';
import { useForm } from '@/hooks/use-form';

interface UserFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (userData: User) => void;
    onError: (error: any) => void;
    selectedUser: User | null;
}

export default function UserForm({ isOpen, onClose, onSuccess, selectedUser }: UserFormProps) {
    const { roleOptions } = useRoles(isOpen);
    const form = useForm<UserFormData>(INITIAL_USER_FORM_STATE);
    
    const onSubmit = (e: React.FormEvent) => {
        form.handleSubmit(e, () => UserService.saveUser(form.formData, selectedUser?.id),
            (data) => { 
                onSuccess(data); 
                onClose();
            },
            "User",
            !!selectedUser
        );
    };

    const handleMonthlyChange = (val: string) => {
        const monthly = parseFloat(val) || 0;
        const daily = (monthly / 22).toFixed(2);
        const hourly = (parseFloat(daily) / 8).toFixed(2); 
        
        form.setFormData(prev => ({
            ...prev,
            monthlyRate: val,
            dailyRate: daily,
            hourlyRate: hourly
        }));
        
        if (form.errors.monthlyRate || form.errors.dailyRate || form.errors.hourlyRate) {
            const { monthlyRate, dailyRate, hourlyRate, ...rest } = form.errors;
            form.setErrors(rest);
        }
    };
    
    const handleScheduleChange = (index: number, field: string, value: any) => {
        const updated = [...form.formData.weeklyData];
        updated[index] = { ...updated[index], [field]: value };
        form.setFormData(prev => ({ ...prev, weeklyData: updated }));
    };
    
    const handleGlobalStartDateChange = (date: string) => {
        const updatedSchedules = form.formData.weeklyData.map(s => ({ 
            ...s, 
            startDate: date
        }));

        form.setFormData(prev => ({ 
            ...prev, 
            scheduleStartDate: date,
            weeklyData: updatedSchedules
        }));
    };
    
    const resetRates = () => handleMonthlyChange(form.formData.monthlyRate);
    
    useEffect(() => {
        const state = selectedUser
            ? formatUserFormData(selectedUser) 
            : INITIAL_USER_FORM_STATE;

        form.setFormData(state);
    }, [selectedUser, form.setFormData]);

    return (
        <ModalForm
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={onSubmit}
            title={selectedUser ? "Edit User Profile" : "Create New User"}
            description={selectedUser ? "MODIFY EXISTING CREDENTIALS" : "SETUP A NEW OPERATOR"}
            isUpdate={!!selectedUser}
            loading={form.isSubmitting}
            size="5xl"
        >
            <div className="col-span-1 md:col-span-2 flex flex-col gap-5 py-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Name"
                        placeholder="Enter full name"
                        value={form.formData.name}
                        // onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        onChange={(e) => form.handleChange('name', e.target.value)}
                        error={form.errors.name?.[0]}
                    />
                    <Input
                        label="Email Address"
                        type="email"
                        placeholder="Enter email address"
                        value={form.formData.email}
                        onChange={(e) => form.handleChange('email', e.target.value)}
                        error={form.errors.email?.[0]}
                    />
                    <Input
                        label="Password"
                        type="password"
                        placeholder="••••••••"
                        disabled={!!selectedUser}
                        helperText={selectedUser ? "(Leave blank to keep current)" : undefined}
                        value={form.formData.password}
                        onChange={(e) => form.handleChange('password', e.target.value)}
                        error={form.errors.password?.[0]}
                    />
                    <Select
                        label="Role"
                        options={roleOptions}
                        value={form.formData.role}
                        onChange={(val) => form.setFormData({ ...form.formData, role: val })}
                    /> 
                </div>
                
                <Toggle
                    label="Account Status"
                    value={form.formData.status}
                    options={USER_STATUS_OPTIONS}
                    onChange={(newValue) => form.setFormData({ ...form.formData, status: newValue })}
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
                        value={form.formData.monthlyRate}
                        onChange={(e) => handleMonthlyChange(e.target.value)}
                        onFocus={(e) => {
                            if (form.formData.monthlyRate === '0.00') {
                                form.handleChange('monthlyRate', '');
                            } else {
                                e.target.select();
                            }
                        }}
                        onBlur={(e) => {
                            const val = parseFloat(e.target.value);
                            
                            const formattedValue = isNaN(val) || e.target.value === '' 
                                ? '0.00' 
                                : val.toFixed(2);
                            
                            form.handleChange('monthlyRate', formattedValue);
                        }}
                        error={form.errors.monthlyRate?.[0]}
                    />
                    <Input
                        label="Daily Rate"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={form.formData.dailyRate}
                        onClick={resetRates}
                        // onChange={(e) => setFormData({ ...formData, dailyRate: e.target.value })}
                        onChange={(e) => form.handleChange('dailyRate', e.target.value)}
                        error={form.errors.dailyRate?.[0]}
                    />
                    <Input
                        label="Hourly Rate"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={form.formData.hourlyRate}
                        onClick={resetRates}
                        // onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                        onChange={(e) => form.handleChange('hourlyRate', e.target.value)}
                        error={form.errors.hourlyRate?.[0]}
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
                            value={form.formData.scheduleStartDate}
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
                        {form.formData.weeklyData.map((sched, index) => {
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