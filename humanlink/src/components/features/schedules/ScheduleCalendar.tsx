import { useEffect, useRef } from 'react';
import { Moon, Trash2 } from 'lucide-react';
import type { Schedule } from '@/types';
import { getInitials } from '@/utils/userUtils';
import Card from '@/components/ui/Card';
import Searchbar from '@/components/shared/Searchbar';

interface Props {
    data: Schedule[];
    currentDate: Date;
    loading?: boolean;
    scrollToDay?: number | 'start';
    canEdit?: boolean;
    onEditSchedule?: (schedule: Schedule) => void;
    onDeleteSchedule?: (schedule: Schedule) => void;
    showSearch?: boolean;
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    searchPlaceholder?: string;
    resultCount?: number;
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
    showSearch = false,
    searchValue = '',
    onSearchChange,
    searchPlaceholder = 'Search users...',
    resultCount,
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
        <Card className="relative flex h-[min(640px,calc(100vh-14rem))] w-full flex-col overflow-hidden border-slate-200/80 !p-0 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(37,99,235,0.04)]">
            {showSearch && onSearchChange && (
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
                        <Searchbar
                            value={searchValue}
                            onChange={onSearchChange}
                            placeholder={searchPlaceholder}
                        />
                    </div>
                    {searchValue && (
                        <p className="shrink-0 text-xs text-slate-400">
                            {(resultCount ?? data.length)} result{(resultCount ?? data.length) === 1 ? '' : 's'}
                        </p>
                    )}
                </div>
            )}

            <div ref={scrollRef} className="custom-scrollbar relative min-h-0 flex-1 overflow-auto">
                {loading && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-[1px]">
                        <div className="flex flex-col items-center gap-2">
                            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">
                                Loading
                            </span>
                        </div>
                    </div>
                )}

                <table className="w-full border-separate border-spacing-0">
                    <thead className="sticky top-0 z-30">
                        <tr>
                            <th className="sticky left-0 z-40 min-w-[260px] border-b border-r border-blue-100/80 bg-gradient-to-b from-blue-50/90 to-white px-5 py-4 text-left shadow-[4px_0_12px_-8px_rgba(15,23,42,0.15)]">
                                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-700/70">
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
                                        className={`min-w-[148px] border-b border-r border-blue-100/80 px-3 py-3 ${
                                            isToday
                                                ? 'bg-blue-50'
                                                : isWeekend
                                                    ? 'bg-slate-50/90'
                                                    : 'bg-gradient-to-b from-blue-50/90 to-white'
                                        }`}
                                    >
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-blue-700/60">
                                                {date.toLocaleDateString('default', { weekday: 'short' })}
                                            </span>
                                            <span
                                                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold tabular-nums ${
                                                    isToday
                                                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/25'
                                                        : isWeekend
                                                            ? 'text-slate-400'
                                                            : 'text-slate-700'
                                                }`}
                                            >
                                                {day}
                                            </span>
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
                                    <td className="sticky left-0 z-20 border-b border-r border-slate-100 bg-white px-5 py-3.5 shadow-[4px_0_12px_-8px_rgba(15,23,42,0.12)] transition-colors group-hover:bg-blue-50/40">
                                        {canEdit ? (
                                            <div className="flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => onEditSchedule?.(schedule)}
                                                    className="-mx-2 flex flex-1 items-center gap-3 rounded-xl px-2 py-1.5 text-left transition-colors hover:bg-blue-50/70"
                                                >
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-[11px] font-bold uppercase text-white shadow-sm shadow-blue-600/15">
                                                        {getInitials(schedule.user?.name || '?')}
                                                    </div>
                                                    <div className="flex min-w-0 flex-col">
                                                        <span className="truncate text-sm font-semibold text-slate-800">
                                                            {schedule.user?.name}
                                                        </span>
                                                        <span className="text-[11px] font-medium text-slate-400">
                                                            Click to edit schedule
                                                        </span>
                                                    </div>
                                                </button>
                                                {onDeleteSchedule && (
                                                    <button
                                                        type="button"
                                                        onClick={() => onDeleteSchedule(schedule)}
                                                        className="rounded-lg p-2 text-slate-300 transition-colors hover:bg-rose-50 hover:text-rose-600"
                                                        aria-label="Delete schedule"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="-mx-2 flex items-center gap-3 px-2 py-1.5">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-[11px] font-bold uppercase text-white shadow-sm shadow-blue-600/15">
                                                    {getInitials(schedule.user?.name || '?')}
                                                </div>
                                                <div className="flex min-w-0 flex-col">
                                                    <span className="truncate text-sm font-semibold text-slate-800">
                                                        {schedule.user?.name}
                                                    </span>
                                                    <span className="text-[11px] font-medium text-slate-400">
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
                                                className={`border-b border-r border-slate-100 px-2.5 py-3 align-middle ${
                                                    isToday
                                                        ? 'bg-blue-50/50'
                                                        : isWeekend
                                                            ? 'bg-slate-50/50'
                                                            : 'bg-white group-hover:bg-blue-50/20'
                                                }`}
                                            >
                                                <div className="flex min-h-[44px] items-center justify-center">
                                                    {isWorking ? (
                                                        <div
                                                            className={`flex w-full items-center justify-center gap-1.5 rounded-xl px-2.5 py-2.5 shadow-sm shadow-blue-600/15 ${
                                                                dayConfig.isNightShift
                                                                    ? 'bg-blue-800'
                                                                    : 'bg-blue-600'
                                                            }`}
                                                        >
                                                            <span className="whitespace-nowrap text-[11px] font-semibold tracking-tight text-white">
                                                                {formatTime(dayConfig.shiftStart)} - {formatTime(dayConfig.shiftEnd)}
                                                            </span>
                                                            {dayConfig.isNightShift && (
                                                                <Moon size={11} className="shrink-0 text-white/80" />
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="flex min-h-[40px] w-full items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/80">
                                                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
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
                                    <p className="mt-1 text-[12px] text-slate-400">Try another month or clear your search.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}
