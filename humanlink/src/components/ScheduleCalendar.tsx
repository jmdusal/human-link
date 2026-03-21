import React from 'react';
import type { Schedule } from '@/types/models';
import { Moon, User as UserIcon } from 'lucide-react';

interface Props {
    data: Schedule[];
    loading: boolean;
    currentDate: Date;
}

const formatTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    let h = parseInt(hours);
    const ampm = h >= 12 ? 'pm' : 'am';
    h = h % 12;
    h = h ? h : 12;
    return `${h}:${minutes}${ampm}`;
};

export default function ScheduleCalendar({ data, loading, currentDate }: Props) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-24 space-y-4">
                <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Syncing Timeline...</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm shadow-slate-100 flex flex-col h-[600px]">
            <div className="flex bg-slate-50/50 border-b border-slate-100 sticky top-0 z-20">
                <div className="min-w-[240px] px-6 py-4 text-[10px] uppercase tracking-[0.15em] font-bold text-slate-400 border-r border-slate-100 sticky left-0 z-30 bg-slate-50/90 backdrop-blur-sm rounded-tl-2xl">
                    User Identity
                </div>
                
                <div className="flex overflow-x-auto scrollbar-hide">
                    {days.map(day => {
                        const date = new Date(year, month, day);
                        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                        return (
                            <div key={day} className={`min-w-[140px] py-3 text-center border-r border-slate-100 flex flex-col gap-0.5 ${isWeekend ? 'bg-slate-100/30' : ''}`}>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                    {date.toLocaleDateString('default', { weekday: 'short' })}
                                </span>
                                <span className={`text-sm font-bold ${isWeekend ? 'text-slate-300' : 'text-slate-600'}`}>
                                    {day}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-auto scrollbar-thin divide-y divide-slate-100">
                {data.length > 0 ? (
                    data.map((schedule) => (
                        <div key={schedule.id} className="flex hover:bg-slate-50/50 transition-colors group border-b border-slate-100 last:border-0">
                            
                            <div className="min-w-[240px] px-6 py-4 border-r border-slate-100 bg-white sticky left-0 z-10 flex items-center gap-3">
                                <div className="h-9 w-9 shrink-0 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 font-bold text-xs border border-blue-100/50 shadow-sm">
                                    {schedule.user?.name ? schedule.user.name.charAt(0).toUpperCase() : '?'}
                                </div>
                                <div className="flex flex-col truncate">
                                    <span className="text-sm font-bold text-slate-700 truncate">{schedule.user?.name}</span>
                                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">Active Schedule</span>
                                </div>
                            </div>

                            {days.map(day => {
                                const dayOfWeek = new Date(year, month, day).getDay();
                                const dayConfig = schedule.weeklyData?.find(d => d.dayOfWeek === dayOfWeek);
                                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                                return (
                                    <div 
                                        key={day} 
                                        className={`min-w-[160px] px-3 py-4 border-r border-slate-100 flex items-center justify-start relative transition-colors
                                            ${isWeekend ? 'bg-slate-50/40' : 'bg-white hover:bg-slate-50/50'}`}
                                    >
                                        {dayConfig && !dayConfig.isRestDay ? (
                                            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-1 duration-300">
                                                <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${dayConfig.isNightShift ? 'bg-indigo-500' : 'bg-blue-500'}`} />

                                                <div className="flex items-center gap-1.5 overflow-hidden">
                                                    <span className="text-[11px] font-bold text-slate-700 whitespace-nowrap tracking-tight">
                                                        {formatTime(dayConfig.shiftStart)}
                                                    </span>
                                                    
                                                    <span className="text-[10px] font-medium text-slate-400 lowercase italic opacity-70">
                                                        to
                                                    </span>

                                                    <span className="text-[11px] font-bold text-slate-700 whitespace-nowrap tracking-tight">
                                                        {formatTime(dayConfig.shiftEnd)}
                                                    </span>
                                                </div>
                                                
                                                
                                                {dayConfig.isNightShift && <Moon size={10} className="text-indigo-400/50 ml-0.5" />}
                                            </div>
                                        ) : isWeekend ? (
                                            <div className="w-full flex items-center justify-start pl-3.5 opacity-30 group-hover:opacity-100 transition-opacity">
                                                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em] select-none">Off</span>
                                            </div>
                                        ) : null}
                                    </div>
                                );
                            })}
                        </div>
                    ))
                ) : (
                    <div className="p-20 text-center">
                        <p className="text-sm font-medium text-slate-400">No matching team schedules found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}