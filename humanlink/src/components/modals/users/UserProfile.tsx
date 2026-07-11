import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    User as UserIcon,
    Wallet,
    CalendarClock,
    Briefcase,
    Phone,
    Mail,
    ChevronLeft,
    ChevronRight,
    Banknote,
    CalendarDays,
    Clock,
    IdCard,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { StatusBadge } from '@/components/shared/TableCells';
import { formatCurrency } from '@/utils/formatUtils';
import { getInitials } from '@/utils/userUtils';
import type { User } from '@/types';

type UserViewTab = 'overview' | 'employment' | 'schedule' | 'rates' | 'ids';

interface UserTab {
    id: UserViewTab;
    label: string;
    icon: LucideIcon;
}

const TABS: UserTab[] = [
    { id: 'overview', label: 'Overview', icon: UserIcon },
    { id: 'employment', label: 'Employment', icon: Briefcase },
    { id: 'schedule', label: 'Schedule', icon: CalendarClock },
    { id: 'rates', label: 'Rates', icon: Wallet },
    { id: 'ids', label: 'Government IDs', icon: IdCard },
];

interface UserProfileProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    data: User | null;
    onEdit?: (user: User) => void;
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
    return (
        <div className="flex flex-col gap-1 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
            <span className="text-sm font-semibold text-slate-800 truncate">{value || '—'}</span>
        </div>
    );
}

export default function UserProfile({ isOpen, onClose, data, onEdit }: UserProfileProps) {
    const [activeTab, setActiveTab] = useState<UserViewTab>('overview');
    const [currentMonth, setCurrentMonth] = useState(new Date());

    if (!isOpen || !data) return null;

    const roleName = data.roles?.[0]?.name;
    const details = data.details;
    const employmentType = details?.employmentType
        ? details.employmentType.charAt(0).toUpperCase() + details.employmentType.slice(1)
        : null;

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days: (Date | null)[] = [];
        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
        return days;
    };

    const getDaySchedule = (date: Date) => {
        const dayOfWeek = date.getDay();
        const dateStr = date.toISOString().split('T')[0];
        const scheduleRecord = data.schedule;
        if (!scheduleRecord || !scheduleRecord.weeklyData) return null;
        const isWithinRange = dateStr >= scheduleRecord.startDate
            && (!scheduleRecord.endDate || dateStr <= scheduleRecord.endDate);
        if (!isWithinRange) return null;
        return scheduleRecord.weeklyData.find((day: any) => day.dayOfWeek === dayOfWeek);
    };

    const shiftMonth = (delta: number) => {
        setCurrentMonth((prev) => {
            const next = new Date(prev);
            next.setMonth(next.getMonth() + delta);
            return next;
        });
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-50 flex flex-col font-sans antialiased text-slate-900 overflow-hidden">
            <header className="shrink-0 bg-white border-b border-slate-200">
                <div className="flex items-center justify-between gap-4 px-6 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-blue-600 uppercase">
                                {getInitials(data.name)}
                            </span>
                        </div>
                        <div className="flex flex-col min-w-0">
                            <h2 className="text-base font-semibold text-slate-900 truncate leading-tight">
                                {data.name}
                            </h2>
                            <span className="text-xs font-medium text-slate-500 truncate">
                                {details?.jobTitle || data.email}
                                {details?.department ? ` · ${details.department}` : ''}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {onEdit && (
                            <Button variant="secondary" onClick={() => onEdit(data)}>
                                Edit
                            </Button>
                        )}
                        <Button variant="secondary" onClick={onClose}>
                            Exit
                        </Button>
                    </div>
                </div>

                <nav className="flex items-center gap-1 px-6 overflow-x-auto">
                    {TABS.map((tab) => {
                        const isActive = activeTab === tab.id;
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    relative flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap
                                    border-b-2 transition-colors outline-none
                                    ${isActive
                                        ? 'border-blue-600 text-blue-700'
                                        : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                                    }
                                `}
                            >
                                <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </header>

            <main className="flex-1 relative flex flex-col min-h-0 overflow-hidden">
                <div className="flex-1 w-full h-full flex flex-col min-h-0 overflow-y-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="flex-1 w-full p-6"
                        >
                            {activeTab === 'overview' && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 pb-10">
                                    <Card variant="section">
                                        <div className="flex items-center justify-between mb-8">
                                            <div>
                                                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                                    Person overview
                                                </h3>
                                                <p className="text-sm text-slate-500 font-medium">
                                                    Access, status, and contact at a glance
                                                </p>
                                            </div>
                                            <StatusBadge status={data.hrStatus ?? data.status} />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/40 flex items-start gap-4">
                                                <div className="p-3 bg-white rounded-xl border border-slate-100 text-slate-400">
                                                    <Mail size={16} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Email</p>
                                                    <p className="text-sm font-semibold text-slate-800 truncate">{data.email}</p>
                                                </div>
                                            </div>
                                            <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/40 flex items-start gap-4">
                                                <div className="p-3 bg-white rounded-xl border border-slate-100 text-slate-400">
                                                    <Phone size={16} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Mobile</p>
                                                    <p className="text-sm font-semibold text-slate-800 truncate">{details?.mobile || '—'}</p>
                                                </div>
                                            </div>
                                            <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/40 flex items-start gap-4">
                                                <div className="p-3 bg-white rounded-xl border border-slate-100 text-slate-400">
                                                    <Briefcase size={16} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Role / type</p>
                                                    <p className="text-sm font-semibold text-slate-800 truncate">
                                                        {roleName || 'Unassigned'}
                                                        {data.userType ? ` · ${data.userType}` : ''}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Card>
                                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                                                Job snapshot
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <InfoRow label="Job title" value={details?.jobTitle} />
                                                <InfoRow label="Department" value={details?.department} />
                                                <InfoRow label="Employment type" value={employmentType} />
                                                <InfoRow label="Hire date" value={data.hiredAt} />
                                            </div>
                                        </Card>
                                        <Card>
                                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                                                Emergency contact
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <InfoRow label="Name" value={details?.emergencyContactName} />
                                                <InfoRow label="Phone" value={details?.emergencyContactPhone} />
                                                <InfoRow label="Relationship" value={details?.emergencyContactRelationship} />
                                            </div>
                                        </Card>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'employment' && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 pb-10">
                                    <Card variant="section">
                                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">
                                            Employment profile
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            <InfoRow label="Job title" value={details?.jobTitle} />
                                            <InfoRow label="Department" value={details?.department} />
                                            <InfoRow label="Employment type" value={employmentType} />
                                            <InfoRow label="Hire date" value={data.hiredAt} />
                                            <InfoRow label="Terminated" value={data.terminatedAt} />
                                            <InfoRow label="HR status" value={data.hrStatus ?? data.status} />
                                            <InfoRow label="Account status" value={data.status} />
                                        </div>
                                    </Card>
                                    <Card variant="section">
                                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">
                                            Contact details
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            <InfoRow label="Work email" value={data.email} />
                                            <InfoRow label="Mobile" value={details?.mobile} />
                                            <InfoRow label="Emergency contact" value={details?.emergencyContactName} />
                                            <InfoRow label="Emergency phone" value={details?.emergencyContactPhone} />
                                            <InfoRow label="Relationship" value={details?.emergencyContactRelationship} />
                                        </div>
                                    </Card>
                                </div>
                            )}

                            {activeTab === 'schedule' && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
                                    <Card variant="section">
                                        <div className="flex justify-between items-center mb-8">
                                            <div className="flex items-center gap-3 text-slate-400">
                                                <div className="p-2 bg-slate-50 rounded-lg">
                                                    <CalendarClock size={18} className="text-slate-600" />
                                                </div>
                                                <span className="text-sm font-bold text-slate-900 uppercase tracking-widest">
                                                    Work calendar
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100">
                                                <button
                                                    type="button"
                                                    onClick={() => shiftMonth(-1)}
                                                    className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-slate-400 transition-all"
                                                >
                                                    <ChevronLeft size={16} />
                                                </button>
                                                <span className="px-4 text-[11px] font-bold text-slate-700 uppercase tracking-widest min-w-[140px] text-center">
                                                    {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => shiftMonth(1)}
                                                    className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-slate-400 transition-all"
                                                >
                                                    <ChevronRight size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-7 gap-3">
                                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                                <div key={day} className="text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest pb-2">
                                                    {day}
                                                </div>
                                            ))}

                                            {getDaysInMonth(currentMonth).map((date, i) => {
                                                if (!date) return <div key={`empty-${i}`} className="h-16" />;

                                                const sched = getDaySchedule(date);
                                                const isRestDay = sched?.isRestDay;
                                                const isWorkDay = sched && !isRestDay;

                                                return (
                                                    <div
                                                        key={`day-${i}`}
                                                        className={`group relative h-16 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 border ${
                                                            isWorkDay
                                                                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-100'
                                                                : 'bg-slate-50/50 border-transparent text-slate-400'
                                                        }`}
                                                    >
                                                        <span className="text-xs font-bold">{date.getDate()}</span>

                                                        {isWorkDay && (
                                                            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 bg-blue-700 rounded-2xl transition-opacity">
                                                                <span className="text-[9px] font-bold leading-tight text-center">
                                                                    {(sched as any).shiftStart || (sched as any).shift_start}<br />
                                                                    {(sched as any).shiftEnd || (sched as any).shift_end}
                                                                </span>
                                                            </div>
                                                        )}

                                                        {isRestDay && (
                                                            <div className="w-1 h-1 bg-slate-300 rounded-full mt-1" />
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="mt-8 pt-6 border-t border-slate-50 flex gap-6">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 bg-blue-600 rounded-full" />
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Shift scheduled</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 bg-slate-200 rounded-full" />
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Rest day</span>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            )}

                            {activeTab === 'rates' && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
                                    <Card className="flex items-center gap-5">
                                        <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
                                            <Banknote size={24} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Monthly rate</p>
                                            <p className="text-2xl font-bold text-slate-900">₱{formatCurrency(data.rate?.monthlyRate)}</p>
                                        </div>
                                    </Card>
                                    <Card className="flex items-center gap-5">
                                        <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
                                            <CalendarDays size={24} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Daily rate</p>
                                            <p className="text-2xl font-bold text-slate-900">₱{formatCurrency(data.rate?.dailyRate)}</p>
                                        </div>
                                    </Card>
                                    <Card className="flex items-center gap-5">
                                        <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
                                            <Clock size={24} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Hourly rate</p>
                                            <p className="text-2xl font-bold text-slate-900">₱{formatCurrency(data.rate?.hourlyRate)}</p>
                                        </div>
                                    </Card>
                                </div>
                            )}

                            {activeTab === 'ids' && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
                                    <Card variant="section">
                                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">
                                            Statutory IDs
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <InfoRow label="SSS number" value={details?.sssNumber} />
                                            <InfoRow label="PhilHealth number" value={details?.philhealthNumber} />
                                            <InfoRow label="Pag-IBIG number" value={details?.pagibigNumber} />
                                            <InfoRow label="TIN" value={details?.tin} />
                                        </div>
                                    </Card>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
