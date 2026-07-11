import { useMemo, useState, useEffect } from 'react';
import { getInitials } from '@/utils/userUtils';
import { formatISODate } from '@/utils/dateUtils';
import Card from '@/components/ui/Card';
import type { Attendance } from '@/types';

interface Props {
    data: Attendance[];
    currentDate: Date;
    loading?: boolean;
    onSelectAttendance?: (attendance: Attendance) => void;
    onDayAttendancesChange?: (attendances: Attendance[]) => void;
}

function formatDuration(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}h ${String(minutes).padStart(2, '0')}m`;
}

export default function AttendanceCalendar({ data, currentDate, loading, onSelectAttendance, onDayAttendancesChange }: Props) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstWeekday = new Date(year, month, 1).getDay();
    const today = new Date();
    const [selectedDay, setSelectedDay] = useState<number | null>(
        today.getFullYear() === year && today.getMonth() === month ? today.getDate() : null,
    );

    const byDate = useMemo(() => {
        const map = new Map<string, Attendance[]>();
        data.forEach((item) => {
            // Prefer plain Y-m-d; otherwise convert via Asia/Manila (avoids UTC day shift).
            const key = /^\d{4}-\d{2}-\d{2}$/.test(item.date)
                ? item.date
                : formatISODate(item.date);
            if (!key) return;
            const list = map.get(key) ?? [];
            list.push(item);
            map.set(key, list);
        });
        return map;
    }, [data]);

    const selectedKey = selectedDay
        ? `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
        : null;
    const selectedAttendances = selectedKey ? (byDate.get(selectedKey) ?? []) : [];

    useEffect(() => {
        onDayAttendancesChange?.(selectedKey ? (byDate.get(selectedKey) ?? []) : []);
    }, [selectedKey, byDate, onDayAttendancesChange]);

    const cells: Array<number | null> = [
        ...Array.from({ length: firstWeekday }, () => null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];

    while (cells.length % 7 !== 0) {
        cells.push(null);
    }

    return (
        <div className="space-y-6">
            <Card className="!p-0 overflow-hidden border-slate-200 relative">
                {loading && (
                    <div className="absolute inset-0 z-20 bg-white/75 backdrop-blur-[1px] flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                <div className="grid grid-cols-7 border-b border-slate-100">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((label) => (
                        <div key={label} className="px-2 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            {label}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 auto-rows-[minmax(96px,1fr)]">
                    {cells.map((day, index) => {
                        if (!day) {
                            return <div key={`empty-${index}`} className="border-b border-r border-slate-50 bg-slate-50/40" />;
                        }

                        const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const dayItems = byDate.get(key) ?? [];
                        const isToday =
                            today.getFullYear() === year
                            && today.getMonth() === month
                            && today.getDate() === day;
                        const isSelected = selectedDay === day;

                        return (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setSelectedDay(day)}
                                className={`border-b border-r border-slate-100 p-2 text-left transition-colors hover:bg-blue-50/40 ${
                                    isSelected ? 'bg-blue-50/70' : 'bg-white'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className={`text-sm font-bold ${isToday ? 'text-blue-600' : 'text-slate-700'}`}>
                                        {day}
                                    </span>
                                    {dayItems.length > 0 && (
                                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                            {dayItems.length}
                                        </span>
                                    )}
                                </div>
                                <div className="flex -space-x-1.5">
                                    {dayItems.slice(0, 4).map((item) => (
                                        <div
                                            key={item.id}
                                            title={item.user?.name}
                                            className="w-6 h-6 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center"
                                        >
                                            <span className="text-[8px] font-bold text-emerald-700 uppercase">
                                                {getInitials(item.user?.name || '?')}
                                            </span>
                                        </div>
                                    ))}
                                    {dayItems.length > 4 && (
                                        <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center">
                                            <span className="text-[8px] font-bold text-slate-500">+{dayItems.length - 4}</span>
                                        </div>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </Card>

            <Card className="border-slate-200">
                <h3 className="text-sm font-bold text-slate-800 mb-1">
                    {selectedDay
                        ? `Present on ${currentDate.toLocaleString('default', { month: 'long' })} ${selectedDay}`
                        : 'Select a day'}
                </h3>
                <p className="text-xs text-slate-400 mb-5">
                    Users who started attendance on this date.
                </p>

                {selectedAttendances.length === 0 ? (
                    <div className="py-10 text-center text-sm text-slate-400 font-medium">
                        No one present on this day.
                    </div>
                ) : (
                    <div className="space-y-3 max-h-[520px] overflow-auto pr-1">
                        {selectedAttendances.map((item) => (
                            <button
                                type="button"
                                key={item.id}
                                onClick={() => onSelectAttendance?.(item)}
                                className="w-full flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:border-blue-200 hover:bg-blue-50/40 text-left transition-colors"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-[10px] font-bold uppercase shrink-0">
                                        {getInitials(item.user?.name || '?')}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-slate-800 truncate">{item.user?.name}</p>
                                        <p className="text-[11px] text-slate-400 capitalize">
                                            {item.status}
                                            {item.startIp ? ` · ${item.startIp}` : ''}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-sm font-bold text-slate-700 tabular-nums">
                                        {formatDuration(item.totalMs)}
                                    </p>
                                    {item.startedAt && (
                                        <p className="text-[10px] text-slate-400">
                                            In {new Date(item.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}
