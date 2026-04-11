import React, { useRef, useEffect } from 'react';
import type { Schedule } from '@/types';
import { Moon, Calendar } from 'lucide-react';

interface Props {
    data: Schedule[];
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

export default function ScheduleCalendar({ data, currentDate }: Props) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col h-[600px]">
            <div className="flex-1 overflow-auto scrollbar-thin">
                <table className="w-full border-separate border-spacing-0">
                    <thead className="sticky top-0 z-30">
                        <tr>
                            <th className="sticky left-0 z-40 bg-slate-50/95 backdrop-blur border-b border-r border-slate-200 p-4 text-left min-w-[240px]">
                                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">
                                    User Identity
                                </span>
                            </th>
                            
                            {/* Days Headers */}
                            {days.map(day => {
                                const date = new Date(year, month, day);
                                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                                return (
                                    <th key={day} className={`min-w-[140px] p-3 border-b border-r border-slate-100 bg-slate-50/95 backdrop-blur ${isWeekend ? 'bg-slate-100/50' : ''}`}>
                                        <div className="flex flex-col items-center gap-0.5">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                                                {date.toLocaleDateString('default', { weekday: 'short' })}
                                            </span>
                                            <span className={`text-sm font-semibold ${isWeekend ? 'text-slate-400' : 'text-slate-700'}`}>
                                                {day}
                                            </span>
                                        </div>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    
                    <tbody className="divide-y divide-slate-100">
                        {data.length > 0 ? (
                            data.map((schedule) => (
                                <tr key={schedule.id} className="group hover:bg-slate-50/30 transition-colors">
                                    <td className="sticky left-0 z-20 bg-white group-hover:bg-slate-50/30 border-r border-slate-100 p-4 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 shrink-0 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 font-bold text-xs border border-indigo-100">
                                                {schedule.user?.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm font-semibold text-slate-700 truncate">{schedule.user?.name}</span>
                                                <span className="text-[10px] text-slate-400 font-medium">Standard Shift</span>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Daily Slots */}
                                    {days.map(day => {
                                        const date = new Date(year, month, day);
                                        const dayOfWeek = date.getDay();
                                        const dayConfig = schedule.weeklyData?.find(d => d.dayOfWeek === dayOfWeek);
                                        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                                        
                                        return (
                                            <td key={day} className={`px-4 py-5 border-r border-slate-100 align-middle ${isWeekend ? 'bg-slate-50/20' : ''}`}>
                                                {dayConfig && !dayConfig.isRestDay ? (
                                                    <div className={`flex items-center gap-2 p-2 rounded-lg border transition-all
                                                        ${dayConfig.isNightShift 
                                                            ? 'bg-indigo-50/40 border-indigo-100 text-indigo-700' 
                                                            : 'bg-blue-50/40 border-blue-100 text-blue-700'}`}>
                                                        
                                                        <div className={`h-1.5 w-1.5 rounded-full ${dayConfig.isNightShift ? 'bg-indigo-500' : 'bg-blue-500'}`} />
                                                        
                                                        <span className="text-[11px] font-bold tracking-tight whitespace-nowrap">
                                                            {formatTime(dayConfig.shiftStart)} - {formatTime(dayConfig.shiftEnd)}
                                                        </span>
                                                        
                                                        {dayConfig.isNightShift && <Moon size={10} className="ml-auto opacity-40" />}
                                                    </div>
                                                ) : (
                                                    <div className="w-full flex items-center justify-center gap-2 transition-opacity">
                                                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Off</span>
                                                    </div>
                                                )}
                                            </td>
                                        );
                                        // return (
                                        //     <td key={day} className={`p-2 border-r border-slate-100 align-middle ${isWeekend ? 'bg-slate-50/30' : ''}`}>
                                        //         {dayConfig && !dayConfig.isRestDay ? (
                                        //             <div className={`rounded-lg p-2 flex flex-col gap-1 border transition-all
                                        //                 ${dayConfig.isNightShift 
                                        //                     ? 'bg-indigo-50/50 border-indigo-100 text-indigo-700' 
                                        //                     : 'bg-blue-50/50 border-blue-100 text-blue-700'}`}>
                                        //                 <div className="flex items-center justify-between">
                                        //                     <span className="text-[10px] font-bold whitespace-nowrap">
                                        //                         {formatTime(dayConfig.shiftStart)} - {formatTime(dayConfig.shiftEnd)}
                                        //                     </span>
                                        //                     {dayConfig.isNightShift && <Moon size={10} className="opacity-50" />}
                                        //                 </div>
                                        //             </div>
                                        //         ) : (
                                        //             <div className="h-full w-full flex items-center justify-center opacity-0 group-hover:opacity-100">
                                        //                 <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Off</span>
                                        //             </div>
                                        //         )}
                                        //     </td>
                                        // );
                                    })}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={days.length + 1} className="p-20 text-center text-slate-400 text-sm">
                                    No schedules found for this period.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}