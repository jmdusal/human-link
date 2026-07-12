import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { getInitials } from '@/utils/userUtils';
import { formatISODate } from '@/utils/dateUtils';
import Card from '@/components/ui/Card';
import AttendancePresentModal from '@/components/modals/attendances/AttendancePresentModal';
import type { Attendance } from '@/types';

interface Props {
    data: Attendance[];
    currentDate: Date;
    loading?: boolean;
}

export default function AttendanceCalendar({ data, currentDate, loading }: Props) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstWeekday = new Date(year, month, 1).getDay();
    const today = new Date();
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        setSelectedDay(null);
        setIsModalOpen(false);
    }, [year, month]);

    const byDate = useMemo(() => {
        const map = new Map<string, Attendance[]>();
        data.forEach((item) => {
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
    const dateLabel = selectedDay
        ? `${currentDate.toLocaleString('default', { month: 'long' })} ${selectedDay}, ${year}`
        : '';

    const cells: Array<number | null> = [
        ...Array.from({ length: firstWeekday }, () => null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];

    while (cells.length % 7 !== 0) {
        cells.push(null);
    }

    const openDay = (day: number) => {
        setSelectedDay(day);
        setIsModalOpen(true);
    };

    return (
        <>
            <Card className="relative w-full overflow-hidden border-slate-200/80 !p-0 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(37,99,235,0.04)]">
                {loading && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/80 backdrop-blur-[1px]">
                        <div className="flex flex-col items-center gap-2">
                            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">
                                Loading
                            </span>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-7 border-b border-blue-100/80 bg-gradient-to-b from-blue-50/90 to-white">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((label) => (
                        <div
                            key={label}
                            className="px-1 py-3.5 text-center text-[10px] font-bold uppercase tracking-[0.14em] text-blue-700/70 sm:px-2"
                        >
                            {label}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 auto-rows-[minmax(76px,1fr)] sm:auto-rows-[minmax(104px,1fr)]">
                    {cells.map((day, index) => {
                        if (!day) {
                            return (
                                <div
                                    key={`empty-${index}`}
                                    className="border-b border-r border-slate-100/80 bg-slate-50/50"
                                />
                            );
                        }

                        const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const dayItems = byDate.get(key) ?? [];
                        const hasPresence = dayItems.length > 0;
                        const isToday =
                            today.getFullYear() === year
                            && today.getMonth() === month
                            && today.getDate() === day;
                        const isSelected = selectedDay === day && isModalOpen;

                        return (
                            <button
                                key={key}
                                type="button"
                                onClick={() => openDay(day)}
                                className={`group relative border-b border-r border-slate-100 p-1.5 text-left transition-all duration-200 sm:p-2.5 ${
                                    isSelected
                                        ? 'bg-blue-50 ring-2 ring-inset ring-blue-500/40'
                                        : hasPresence
                                            ? 'bg-blue-50/40 hover:bg-blue-50'
                                            : 'bg-white hover:bg-blue-50/50'
                                }`}
                            >
                                <div className="mb-1.5 sm:mb-2.5">
                                    <span
                                        className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold tabular-nums transition-colors ${
                                            isToday
                                                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/25'
                                                : isSelected
                                                    ? 'text-blue-700'
                                                    : 'text-slate-700 group-hover:text-blue-700'
                                        }`}
                                    >
                                        {day}
                                    </span>
                                </div>

                                <div className="flex -space-x-1.5">
                                    {dayItems.slice(0, 4).map((item) => (
                                        <div
                                            key={item.id}
                                            title={item.user?.name}
                                            className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm shadow-blue-600/15"
                                        >
                                            <span className="text-[8px] font-bold uppercase tracking-wide text-white">
                                                {getInitials(item.user?.name || '?')}
                                            </span>
                                        </div>
                                    ))}
                                    {dayItems.length > 4 && (
                                        <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-blue-100">
                                            <span className="text-[8px] font-bold text-blue-700">
                                                +{dayItems.length - 4}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {hasPresence && (
                                    <span className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-blue-500/0 via-blue-500/70 to-blue-500/0 opacity-0 transition-opacity group-hover:opacity-100" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </Card>

            <AnimatePresence>
                {isModalOpen && selectedDay != null && (
                    <AttendancePresentModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        dateLabel={dateLabel}
                        attendances={selectedAttendances}
                    />
                )}
            </AnimatePresence>
        </>
    );
}
