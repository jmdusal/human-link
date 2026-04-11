import { useState } from 'react';
import ModalTabs from '@/components/ui/ModalTabs';
import CloseButton from '@/components/ui/CloseButton';
import { formatCurrency } from '@/utils/formatUtils';
import { getInitials } from '@/utils/userUtils';
import { 
    Mail, Shield, User as UserIcon, 
    Wallet, History, Settings,
    Banknote, Clock, CalendarDays,
    CalendarClock, ChevronLeft, ChevronRight, CheckCircle2
} from 'lucide-react';

interface ModalViewProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    data: any;
}

const TABS = [
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'schedule', label: 'Schedule', icon: CalendarClock },
    { id: 'rates', label: 'Rates & Salary', icon: Wallet },
    { id: 'history', label: 'History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
];

export default function UserProfile({ isOpen, onClose, title, data }: ModalViewProps) {
    const [activeTab, setActiveTab] = useState('profile');
    const [currentMonth, setCurrentMonth] = useState(new Date());

    if (!isOpen || !data) return null;

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days = [];
        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
        return days;
    };

    const getDaySchedule = (date: Date) => {
        const dayOfWeek = date.getDay();
        const dateStr = date.toISOString().split('T')[0];
        const scheduleRecord = data.schedule; 
        if (!scheduleRecord || !scheduleRecord.weeklyData) return null;
        const isWithinRange = dateStr >= scheduleRecord.startDate && 
                            (!scheduleRecord.endDate || dateStr <= scheduleRecord.endDate);
        if (!isWithinRange) return null;
        return scheduleRecord.weeklyData.find((day: any) => day.dayOfWeek === dayOfWeek);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-in fade-in duration-300">
            
            {/* TOP BAR */}
            <div className="px-6 py-4 flex justify-between items-center border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Shield className="text-white" size={16} />
                    </div>
                    <span className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
                        {title}
                    </span>
                </div>

                <CloseButton onClose={onClose} />
                {/* <button
                    onClick={onClose}
                    className="p-2 rounded-full text-black hover:bg-slate-100 transition-colors"
                >
                    <X size={18} strokeWidth={2.5} />
                </button> */}
            </div>

            {/* HERO SECTION */}
            <div className="bg-slate-50/50 border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center gap-6">
                    <div className="relative">
                        {/* <div className={`h-20 w-20 ${data.color || 'bg-indigo-600'} rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-inner`}> */}
                        <div className="h-20 w-20 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-inner">
                            {getInitials(data.name)}
                        </div>
                    </div>
                    
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{data.name}</h2>
                        <div className="flex items-center justify-center md:justify-start gap-3 mt-1 text-sm text-slate-500 font-medium">
                            <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[11px] uppercase tracking-wider text-slate-600">
                                {data.role || 'Member'}
                            </span>
                            <span className="flex items-center gap-1">
                                ID: #{data.id || '000'}
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-all">
                            Edit Info
                        </button>
                    </div>
                </div>

                {/* TABS */}
                <ModalTabs 
                    tabs={TABS} 
                    activeTab={activeTab} 
                    onTabChange={setActiveTab} 
                />
                {/* <div className="max-w-7xl mx-auto px-6">
                    <nav className="flex gap-8">
                        {TABS.map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`pb-4 text-sm font-medium transition-all relative flex items-center gap-2 ${
                                        isActive ? "text-blue-600" : "text-slate-500 hover:text-slate-700"
                                    }`}
                                >
                                    <tab.icon size={16} />
                                    {tab.label}
                                    {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
                                </button>
                            );
                        })}
                    </nav>
                </div> */}
            </div>

            {/* CONTENT AREA */}
            {/* <div className="flex-1 overflow-y-auto"> */}
            <div className="flex-1 overflow-y-auto bg-[#F8FAFC]">
                <div className="max-w-7xl mx-auto px-6 py-10">
                    
                    {/* PROFILE TAB */}
                    {activeTab === 'profile' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-2">
                            <div className="md:col-span-2 space-y-8">
                                <div>
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Contact Details</h3>
                                    <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50/30 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm text-slate-400">
                                                <Mail size={16} />
                                            </div>
                                            {/* <div> */}
                                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter leading-none mb-1">Primary Email</p>
                                                <p className="text-lg font-semibold text-slate-700">{data.email}</p>
                                            {/* </div> */}
                                        </div>
                                        <CheckCircle2 size={16} className="text-emerald-500" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SCHEDULE TAB */}
                    {activeTab === 'schedule' && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
                                <div className="flex justify-between items-center mb-8">
                                    <div className="flex items-center gap-3 text-slate-400">
                                        <div className="p-2 bg-slate-50 rounded-lg">
                                            <CalendarClock size={18} className="text-slate-600" />
                                        </div>
                                        <span className="text-[14px] font-bold text-slate-900 uppercase tracking-widest">Work Calendar</span>
                                    </div>

                                    <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100">
                                        <button 
                                            onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
                                            className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-slate-400 transition-all"
                                        >
                                            <ChevronLeft size={16} />
                                        </button>
                                        <span className="px-4 text-[11px] font-bold text-slate-700 uppercase tracking-widest min-w-[140px] text-center">
                                            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                        </span>
                                        <button 
                                            onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
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
                                                        ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-100" 
                                                        : "bg-slate-50/50 border-transparent text-slate-400"
                                                }`}
                                            >
                                                <span className="text-xs font-bold">{date.getDate()}</span>
                                                
                                                {isWorkDay && (
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 bg-blue-700 rounded-2xl transition-opacity">
                                                        <span className="text-[9px] font-bold leading-tight text-center">
                                                            {(sched.shift_start ?? sched.shiftStart)}<br/>
                                                            {(sched.shift_end ?? sched.shiftEnd)}
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
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Shift Scheduled</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 bg-slate-200 rounded-full" />
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Rest Day</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* RATES TAB */}
                    {activeTab === 'rates' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2">

                            <div className="p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5">
                                <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
                                    <Banknote size={24}/>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Monthly Rate</p>
                                    <p className="text-2xl font-bold text-slate-900">₱{formatCurrency(data.rate?.monthlyRate)}</p>
                                </div>
                             </div>
                             
                             <div className="p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5">
                                <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
                                    <CalendarDays size={24}/>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Daily Rate</p>
                                    <p className="text-2xl font-bold text-slate-900">₱{formatCurrency(data.rate?.dailyRate)}</p>
                                </div>
                             </div>
                             
                             <div className="p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5">
                                <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
                                    <Clock size={24}/>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Hourly Rate</p>
                                    <p className="text-2xl font-bold text-slate-900">₱{formatCurrency(data.rate?.hourlyRate)}</p>
                                </div>
                             </div>
                             
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}