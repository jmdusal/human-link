import { useEffect, useRef } from 'react';
import { Moon, Trash2 } from 'lucide-react';
import type { Schedule } from '@/types';
import { getInitials } from '@/utils/userUtils';
import Card from '@/components/ui/Card';

interface Props {
    data: Schedule[];
    currentDate: Date;
    loading?: boolean;
    scrollToDay?: number | 'start';
    canEdit?: boolean;
    onEditSchedule?: (schedule: Schedule) => void;
    onDeleteSchedule?: (schedule: Schedule) => void;
}

const formatTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    let h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'pm' : 'am';
    h = h % 12;
    h = h ? h : 12;
    return `${h}:${minutes}${ampm}`;
};

export default function ScheduleCalendar({
    data,
    currentDate,
    loading,
    scrollToDay = 'start',
    canEdit = false,
    onEditSchedule,
    onDeleteSchedule,
}: Props) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
    const todayDay = isCurrentMonth ? today.getDate() : null;

    useEffect(() => {
        const container = scrollRef.current;
        if (!container) return;

        const frame = requestAnimationFrame(() => {
            if (scrollToDay === 'start' || !scrollToDay) {
                container.scrollTo({ left: 0, behavior: 'smooth' });
                return;
            }

            const target = container.querySelector<HTMLElement>(`thead [data-day="${scrollToDay}"]`);
            if (!target) {
                container.scrollTo({ left: 0, behavior: 'smooth' });
                return;
            }

            const stickyWidth = 260;
            const containerRect = container.getBoundingClientRect();
            const targetRect = target.getBoundingClientRect();
            const nextLeft = container.scrollLeft + (targetRect.left - containerRect.left) - stickyWidth;

            container.scrollTo({ left: Math.max(nextLeft, 0), behavior: 'smooth' });
        });

        return () => cancelAnimationFrame(frame);
    }, [year, month, scrollToDay]);

    return (
        <Card className="!p-0 overflow-hidden flex flex-col h-[640px] border-slate-200">
            <div ref={scrollRef} className="flex-1 overflow-auto relative custom-scrollbar">
                {loading && (
                    <div className="absolute inset-0 z-50 bg-white/75 backdrop-blur-[1px] flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                                Updating view...
                            </span>
                        </div>
                    </div>
                )}

                <table className="w-full border-separate border-spacing-0">
                    <thead className="sticky top-0 z-30">
                        <tr>
                            <th className="sticky left-0 z-40 bg-white border-b border-r border-slate-200 px-5 py-4 text-left min-w-[260px] shadow-[4px_0_12px_-8px_rgba(15,23,42,0.15)]">
                                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">
                                    User Identity
                                </span>
                            </th>

                            {days.map((day) => {
                                const date = new Date(year, month, day);
                                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                                const isToday = todayDay === day;

                                return (
                                    <th
                                        key={day}
                                        data-day={day}
                                        className={`min-w-[148px] px-3 py-3 border-b border-r border-slate-100 ${
                                            isToday
                                                ? 'bg-blue-600 text-white'
                                                : isWeekend
                                                    ? 'bg-slate-100/80'
                                                    : 'bg-slate-50'
                                        }`}
                                    >
                                        <div className="flex flex-col items-center gap-1">
                                            <span
                                                className={`text-[9px] font-bold uppercase tracking-wider ${
                                                    isToday ? 'text-blue-100' : 'text-slate-400'
                                                }`}
                                            >
                                                {date.toLocaleDateString('default', { weekday: 'short' })}
                                            </span>
                                            <span
                                                className={`text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full ${
                                                    isToday
                                                        ? 'bg-white text-blue-700'
                                                        : isWeekend
                                                            ? 'text-slate-400'
                                                            : 'text-slate-700'
                                                }`}
                                            >
                                                {day}
                                            </span>
                                            {isToday && (
                                                <span className="text-[9px] font-bold uppercase tracking-widest text-blue-100">
                                                    Today
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>

                    <tbody>
                        {data.length > 0 ? (
                            data.map((schedule) => (
                                <tr key={schedule.id} className="group">
                                    <td className="sticky left-0 z-20 bg-white group-hover:bg-slate-50 border-b border-r border-slate-100 px-5 py-3.5 transition-colors shadow-[4px_0_12px_-8px_rgba(15,23,42,0.12)]">
                                        {canEdit ? (
                                            <div className="flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => onEditSchedule?.(schedule)}
                                                    className="flex items-center gap-3 flex-1 text-left rounded-xl hover:bg-blue-50/70 px-2 py-1.5 -mx-2 transition-colors"
                                                >
                                                    <div className="h-10 w-10 shrink-0 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-[11px] uppercase shadow-sm">
                                                        {getInitials(schedule.user?.name || '?')}
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-sm font-semibold text-slate-800 truncate">
                                                            {schedule.user?.name}
                                                        </span>
                                                        <span className="text-[11px] text-slate-400 font-medium">
                                                            Click to edit schedule
                                                        </span>
                                                    </div>
                                                </button>
                                                {onDeleteSchedule && (
                                                    <button
                                                        type="button"
                                                        onClick={() => onDeleteSchedule(schedule)}
                                                        className="p-2 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                                        aria-label="Delete schedule"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3 px-2 py-1.5 -mx-2">
                                                <div className="h-10 w-10 shrink-0 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-[11px] uppercase shadow-sm">
                                                    {getInitials(schedule.user?.name || '?')}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-sm font-semibold text-slate-800 truncate">
                                                        {schedule.user?.name}
                                                    </span>
                                                    <span className="text-[11px] text-slate-400 font-medium">
                                                        Your schedule
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </td>

                                    {days.map((day) => {
                                        const date = new Date(year, month, day);
                                        const dayOfWeek = date.getDay();
                                        const dayConfig = schedule.weeklyData?.find((d) => d.dayOfWeek === dayOfWeek);
                                        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                                        const isToday = todayDay === day;
                                        const isWorking = dayConfig && !dayConfig.isRestDay;

                                        return (
                                            <td
                                                key={day}
                                                data-day={day}
                                                className={`px-2.5 py-3 border-b border-r border-slate-100 align-middle ${
                                                    isToday
                                                        ? 'bg-blue-50/70'
                                                        : isWeekend
                                                            ? 'bg-slate-50/60'
                                                            : 'bg-white group-hover:bg-slate-50/40'
                                                }`}
                                            >
                                                <div className="min-h-[44px] flex items-center justify-center">
                                                    {isWorking ? (
                                                        <div
                                                            className={`w-full flex items-center justify-center gap-1.5 px-2.5 py-2.5 rounded-xl shadow-sm ${
                                                                dayConfig.isNightShift
                                                                    ? 'bg-indigo-700'
                                                                    : 'bg-blue-600'
                                                            }`}
                                                        >
                                                            <span className="text-[11px] font-semibold tracking-tight whitespace-nowrap text-white">
                                                                {formatTime(dayConfig.shiftStart)} - {formatTime(dayConfig.shiftEnd)}
                                                            </span>
                                                            {dayConfig.isNightShift && (
                                                                <Moon size={11} className="text-white/80 shrink-0" />
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="w-full min-h-[40px] flex items-center justify-center rounded-xl bg-slate-100/80 border border-dashed border-slate-200">
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                                Off
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={days.length + 1} className="p-20 text-center">
                                    <p className="text-sm font-medium text-slate-500">No schedules found for this period.</p>
                                    <p className="text-[12px] text-slate-400 mt-1">Try another month or clear your search.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}
