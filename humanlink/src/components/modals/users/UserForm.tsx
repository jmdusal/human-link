import React, { useState, useEffect } from 'react';
import ModalForm from '@/components/modals/ModalForm';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Toggle from '@/components/ui/Toggle';
import DateInput from '@/components/ui/DateInput';
import Checkbox from '@/components/ui/Checkbox';
import type { User, UserFormData } from '@/types';
import { USER_STATUS_OPTIONS } from '@/constants';
import {
    formatUserFormData,
    INITIAL_USER_FORM_STATE,
    DAYS_NAME,
    EMPLOYMENT_TYPE_OPTIONS,
} from '@/utils/userUtils';
import { UserService } from '@/services/UserService';
import { useRoles } from '@/hooks/use-roles';
import { useUserTypes } from '@/hooks/use-user-types';
import { useForm } from '@/hooks/use-form';
import ModalTabs from '@/components/ui/ModalTabs';
import {
    Briefcase,
    Calendar,
    DollarSign,
    IdCard,
    User as UserIcon,
} from 'lucide-react';

interface UserFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (userData: User) => void;
    onError: (error: any) => void;
    selectedUser: User | null;
}

export default function UserForm({ isOpen, onClose, onSuccess, selectedUser }: UserFormProps) {
    const [activeTab, setActiveTab] = useState('account');
    const { roleOptions } = useRoles(isOpen);
    const { userTypeOptions } = useUserTypes(isOpen);
    const form = useForm<UserFormData>(INITIAL_USER_FORM_STATE);
    const isEditing = !!selectedUser;

    const TABS = [
        { id: 'account', label: 'Account', icon: UserIcon },
        { id: 'employment', label: 'Employment', icon: Briefcase },
        { id: 'government', label: 'Government IDs', icon: IdCard },
        { id: 'compensation', label: 'Compensation', icon: DollarSign },
        { id: 'schedule', label: 'Work Schedule', icon: Calendar },
    ];

    const onSubmit = (e: React.FormEvent) => {
        form.handleSubmit(e, () => UserService.saveUser(form.formData, selectedUser?.id),
            (data) => {
                onSuccess(data);
                onClose();
            },
            'User',
            isEditing
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
            hourlyRate: hourly,
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
            startDate: date,
        }));

        form.setFormData(prev => ({
            ...prev,
            scheduleStartDate: date,
            weeklyData: updatedSchedules,
        }));
    };

    const resetRates = () => handleMonthlyChange(form.formData.monthlyRate);

    useEffect(() => {
        if (!isOpen) return;

        const state = selectedUser
            ? formatUserFormData(selectedUser)
            : INITIAL_USER_FORM_STATE;

        form.setFormData(state);
        setActiveTab('account');
    }, [isOpen, selectedUser, form.setFormData]);

    useEffect(() => {
        if (!isOpen || selectedUser || form.formData.userTypeId || userTypeOptions.length === 0) {
            return;
        }

        const employeeOption = userTypeOptions.find((option) =>
            option.label.toLowerCase() === 'employee'
        );

        form.setFormData((prev) => ({
            ...prev,
            userTypeId: employeeOption?.value || userTypeOptions[0].value,
        }));
    }, [isOpen, selectedUser, userTypeOptions, form.formData.userTypeId, form.setFormData]);

    return (
        <ModalForm
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={onSubmit}
            title={isEditing ? 'Edit User' : 'Create User'}
            description={isEditing
                ? 'Update account, job, pay, and schedule details'
                : 'Set up access first — job, pay, and IDs can be filled later'}
            isUpdate={isEditing}
            loading={form.isSubmitting}
            size="5xl"
        >
            <ModalTabs
                tabs={TABS}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            <div className="col-span-1 md:col-span-2 flex flex-col gap-5 py-2 min-h-[500px]">
                {activeTab === 'account' && (
                    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                        <section className="space-y-3">
                            <div>
                                <h3 className="text-sm font-semibold text-slate-800">Profile</h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Basic identity used across attendance, leave, and payroll.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Full name"
                                    placeholder="Enter full name"
                                    value={form.formData.name}
                                    onChange={(e) => form.handleChange('name', e.target.value)}
                                    error={form.errors.name?.[0]}
                                />
                                <Input
                                    label="Work email"
                                    type="email"
                                    placeholder="Enter email address"
                                    value={form.formData.email}
                                    onChange={(e) => form.handleChange('email', e.target.value)}
                                    error={form.errors.email?.[0]}
                                />
                            </div>
                        </section>

                        {!isEditing && (
                            <section className="space-y-3">
                                <div>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Prefer invite email so the person sets their own password.
                                    </p>
                                </div>
                                <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        checked={!!form.formData.sendInvite}
                                        onChange={(e) => form.setFormData({
                                            ...form.formData,
                                            sendInvite: e.target.checked,
                                            password: e.target.checked ? '' : form.formData.password,
                                        })}
                                    />
                                    <span>
                                        <span className="block text-sm font-medium text-slate-800">Send invite email</span>
                                        <span className="block text-xs text-slate-500 mt-0.5">
                                            User receives a link to set their password. Recommended for real onboarding.
                                        </span>
                                    </span>
                                </label>
                                <Input
                                    label={form.formData.sendInvite ? 'Password (skipped when inviting)' : 'Temporary password'}
                                    type="password"
                                    placeholder="••••••••"
                                    disabled={!!form.formData.sendInvite}
                                    value={form.formData.password}
                                    onChange={(e) => form.handleChange('password', e.target.value)}
                                    error={form.errors.password?.[0]}
                                />
                            </section>
                        )}

                        <section className="space-y-3">
                            <div>
                                <h3 className="text-sm font-semibold text-slate-800">Access</h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Role is system access. User type controls day-to-day HR permissions.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Select
                                    label="System role"
                                    options={roleOptions}
                                    value={form.formData.role}
                                    onChange={(val) => form.setFormData({ ...form.formData, role: val })}
                                />
                                <Select
                                    label="User type"
                                    options={userTypeOptions}
                                    value={form.formData.userTypeId}
                                    onChange={(val) => form.setFormData({
                                        ...form.formData,
                                        userTypeId: val,
                                    })}
                                />
                                <div className="md:col-span-2">
                                    <Toggle
                                        label="Account status"
                                        value={form.formData.status}
                                        options={USER_STATUS_OPTIONS}
                                        onChange={(newValue) => form.setFormData({ ...form.formData, status: newValue })}
                                    />
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === 'employment' && (
                    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                        <section className="space-y-3">
                            <div>
                                <h3 className="text-sm font-semibold text-slate-800">Job profile</h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Title, department, hire date, and employment type for day-to-day HR.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Job title"
                                    placeholder="e.g. Software Engineer"
                                    value={form.formData.jobTitle}
                                    onChange={(e) => form.handleChange('jobTitle', e.target.value)}
                                    error={form.errors.jobTitle?.[0]}
                                />
                                <Input
                                    label="Department"
                                    placeholder="e.g. Engineering"
                                    value={form.formData.department}
                                    onChange={(e) => form.handleChange('department', e.target.value)}
                                    error={form.errors.department?.[0]}
                                />
                                <DateInput
                                    label="Hire date"
                                    value={form.formData.hiredAt}
                                    onChange={(date: Date | null) => {
                                        if (date) {
                                            form.handleChange('hiredAt', date.toISOString().split('T')[0]);
                                        }
                                    }}
                                />
                                <Select
                                    label="Employment type"
                                    options={EMPLOYMENT_TYPE_OPTIONS}
                                    value={form.formData.employmentType}
                                    onChange={(val) => form.setFormData({
                                        ...form.formData,
                                        employmentType: val as UserFormData['employmentType'],
                                    })}
                                />
                            </div>
                        </section>

                        <section className="space-y-3">
                            <div>
                                <h3 className="text-sm font-semibold text-slate-800">Contact</h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Mobile and emergency contact for ops and incidents.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Mobile"
                                    placeholder="+63 9XX XXX XXXX"
                                    value={form.formData.mobile}
                                    onChange={(e) => form.handleChange('mobile', e.target.value)}
                                    error={form.errors.mobile?.[0]}
                                />
                                <Input
                                    label="Emergency contact name"
                                    placeholder="Full name"
                                    value={form.formData.emergencyContactName}
                                    onChange={(e) => form.handleChange('emergencyContactName', e.target.value)}
                                    error={form.errors.emergencyContactName?.[0]}
                                />
                                <Input
                                    label="Emergency contact phone"
                                    placeholder="+63 9XX XXX XXXX"
                                    value={form.formData.emergencyContactPhone}
                                    onChange={(e) => form.handleChange('emergencyContactPhone', e.target.value)}
                                    error={form.errors.emergencyContactPhone?.[0]}
                                />
                                <Input
                                    label="Relationship"
                                    placeholder="e.g. Spouse, Parent"
                                    value={form.formData.emergencyContactRelationship}
                                    onChange={(e) => form.handleChange('emergencyContactRelationship', e.target.value)}
                                    error={form.errors.emergencyContactRelationship?.[0]}
                                />
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === 'government' && (
                    <div className="flex flex-col gap-4 animate-in fade-in duration-300">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-800">Statutory IDs</h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Optional now. Needed later for accurate SSS, PhilHealth, Pag-IBIG, and tax deductions.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="SSS number"
                                placeholder="XX-XXXXXXX-X"
                                value={form.formData.sssNumber}
                                onChange={(e) => form.handleChange('sssNumber', e.target.value)}
                                error={form.errors.sssNumber?.[0]}
                            />
                            <Input
                                label="PhilHealth number"
                                placeholder="XX-XXXXXXXXX-X"
                                value={form.formData.philhealthNumber}
                                onChange={(e) => form.handleChange('philhealthNumber', e.target.value)}
                                error={form.errors.philhealthNumber?.[0]}
                            />
                            <Input
                                label="Pag-IBIG number"
                                placeholder="XXXX-XXXX-XXXX"
                                value={form.formData.pagibigNumber}
                                onChange={(e) => form.handleChange('pagibigNumber', e.target.value)}
                                error={form.errors.pagibigNumber?.[0]}
                            />
                            <Input
                                label="TIN"
                                placeholder="XXX-XXX-XXX-XXX"
                                value={form.formData.tin}
                                onChange={(e) => form.handleChange('tin', e.target.value)}
                                error={form.errors.tin?.[0]}
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'compensation' && (
                    <div className="flex flex-col gap-4 animate-in fade-in duration-300">
                        <div className="rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3">
                            <p className="text-sm font-medium text-amber-900">
                                {isEditing ? 'Update pay rates' : 'Optional on create'}
                            </p>
                            <p className="text-xs text-amber-800/80 mt-0.5">
                                You can create the account without rates. Payroll generation skips users with no active rate until this is set.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                                label="Monthly rate (₱)"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={form.formData.monthlyRate}
                                onChange={(e) => handleMonthlyChange(e.target.value)}
                                error={form.errors.monthlyRate?.[0]}
                            />
                            <Input
                                label="Daily rate (₱)"
                                type="number"
                                placeholder="Auto from monthly ÷ 22"
                                value={form.formData.dailyRate}
                                onClick={resetRates}
                                onChange={(e) => form.handleChange('dailyRate', e.target.value)}
                                error={form.errors.dailyRate?.[0]}
                            />
                            <Input
                                label="Hourly rate (₱)"
                                type="number"
                                placeholder="Auto from daily ÷ 8"
                                value={form.formData.hourlyRate}
                                onClick={resetRates}
                                onChange={(e) => form.handleChange('hourlyRate', e.target.value)}
                                error={form.errors.hourlyRate?.[0]}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Monthly allowance (₱)"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={form.formData.allowanceMonthly}
                                onChange={(e) => form.handleChange('allowanceMonthly', e.target.value)}
                                error={form.errors.allowanceMonthly?.[0]}
                            />
                            <DateInput
                                label="Rate effective date"
                                value={form.formData.effectiveDate}
                                onChange={(date: Date | null) => {
                                    if (date) {
                                        form.handleChange('effectiveDate', date.toISOString().split('T')[0]);
                                    }
                                }}
                            />
                        </div>
                        <p className="text-[11px] text-slate-400">
                            Daily and hourly auto-calculate from monthly (22 working days × 8 hours). Click either field to recalculate from monthly.
                        </p>
                    </div>
                )}

                {activeTab === 'schedule' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Effective period</span>
                                <p className="text-sm font-medium text-slate-700 mt-0.5">When this weekly pattern starts</p>
                            </div>
                            <div className="w-full sm:w-64">
                                <DateInput
                                    value={form.formData.scheduleStartDate}
                                    label=""
                                    onChange={(date: Date | null) => {
                                        if (date) {
                                            handleGlobalStartDateChange(date.toISOString().split('T')[0]);
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
                            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-slate-100 bg-slate-50/30">
                                <div className="col-span-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Work day</div>
                                <div className="col-span-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Shift start</div>
                                <div className="col-span-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Shift end</div>
                                <div className="col-span-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right pr-4">Day type</div>
                            </div>

                            <div className="divide-y divide-slate-100">
                                {form.formData.weeklyData.map((sched, index) => {
                                    const isRest = sched.isRestDay;

                                    return (
                                        <div
                                            key={index}
                                            className={`
                                                grid grid-cols-1 md:grid-cols-12 gap-4 items-center px-6 py-3.5 transition-all
                                                ${isRest ? 'bg-slate-50/40 grayscale' : 'bg-white hover:bg-slate-50/50'}
                                            `}
                                        >
                                            <div className="col-span-3">
                                                <span className={`text-sm font-semibold tracking-tight ${isRest ? 'text-slate-400' : 'text-slate-800'}`}>
                                                    {DAYS_NAME[sched.dayOfWeek]}
                                                </span>
                                            </div>

                                            <div className="col-span-3 flex justify-center">
                                                {!isRest ? (
                                                    <Input
                                                        type="time"
                                                        value={sched.shiftStart}
                                                        onChange={(e) => handleScheduleChange(index, 'shiftStart', e.target.value)}
                                                        className="text-center font-medium"
                                                        label=""
                                                    />
                                                ) : (
                                                    <div className="h-10 w-full flex items-center justify-center border border-dashed border-slate-200 rounded-md text-[10px] text-slate-300 font-bold uppercase">OFF</div>
                                                )}
                                            </div>

                                            <div className="col-span-3 flex justify-center">
                                                {!isRest ? (
                                                    <Input
                                                        type="time"
                                                        value={sched.shiftEnd}
                                                        onChange={(e) => handleScheduleChange(index, 'shiftEnd', e.target.value)}
                                                        className="text-center font-medium"
                                                        label=""
                                                    />
                                                ) : (
                                                    <div className="h-10 w-full flex items-center justify-center border border-dashed border-slate-200 rounded-md text-[10px] text-slate-300 font-bold uppercase">OFF</div>
                                                )}
                                            </div>

                                            <div className="col-span-3 flex items-center justify-end gap-3 pr-2">
                                                <span className={`text-sm font-semibold tracking-tight ${isRest ? 'text-blue-600' : 'text-slate-400'}`}>
                                                    {isRest ? 'Rest day' : 'Working'}
                                                </span>
                                                <Checkbox
                                                    checked={isRest}
                                                    onChange={(e) => handleScheduleChange(index, 'isRestDay', e.target.checked)}
                                                    className={`
                                                        scale-110 transition-all cursor-pointer
                                                        border-blue-200 hover:border-blue-500
                                                        accent-blue-600
                                                        ${isRest ? 'ring-4 ring-blue-50' : ''}
                                                    `}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ModalForm>
    );
}
