import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { LeaveRequestService } from '@/services/LeaveRequestService';
import type { LeaveRequest } from '@/types/LeaveRequest';
import { formatSimpleDate } from '@/utils/dateUtils';

function toDateKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function startOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    return d;
}

export default function LeaveCalendarIndex() {
    const [anchor, setAnchor] = useState(() => startOfWeek(new Date()));
    const [items, setItems] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending'>('all');

    const weekDays = useMemo(() => {
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(anchor);
            d.setDate(anchor.getDate() + i);
            return d;
        });
    }, [anchor]);

    const range = useMemo(() => ({
        start: toDateKey(weekDays[0]),
        end: toDateKey(weekDays[6]),
    }), [weekDays]);

    useEffect(() => {
        setLoading(true);
        LeaveRequestService.calendar({
            start: range.start,
            end: range.end,
            status: statusFilter === 'all' ? undefined : statusFilter,
        })
            .then(setItems)
            .catch(() => setItems([]))
            .finally(() => setLoading(false));
    }, [range.start, range.end, statusFilter]);

    const byDay = useMemo(() => {
        const map = new Map<string, LeaveRequest[]>();
        weekDays.forEach((day) => map.set(toDateKey(day), []));

        items.forEach((item) => {
            const startKey = item.startDate.slice(0, 10);
            const endKey = item.endDate.slice(0, 10);

            weekDays.forEach((day) => {
                const key = toDateKey(day);
                if (key >= startKey && key <= endKey) {
                    map.get(key)?.push(item);
                }
            });
        });

        return map;
    }, [items, weekDays]);

    const weekLabel = `${formatSimpleDate(range.start)} – ${formatSimpleDate(range.end)}`;

    return (
        <div className="w-full space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Leave Calendar</h1>
                    <p className="text-sm text-slate-500 mt-1">Who&apos;s out this week across the team.</p>
                </div>
                <div className="flex items-center gap-2">
                    <select
                        className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                    >
                        <option value="all">Approved + Pending</option>
                        <option value="approved">Approved only</option>
                        <option value="pending">Pending only</option>
                    </select>
                    <Button
                        variant="secondary"
                        icon={ChevronLeft}
                        onClick={() => {
                            const d = new Date(anchor);
                            d.setDate(d.getDate() - 7);
                            setAnchor(d);
                        }}
                    />
                    <div className="min-w-[200px] text-center text-sm font-bold text-slate-700">{weekLabel}</div>
                    <Button
                        variant="secondary"
                        icon={ChevronRight}
                        onClick={() => {
                            const d = new Date(anchor);
                            d.setDate(d.getDate() + 7);
                            setAnchor(d);
                        }}
                    />
                    <Button variant="outline" onClick={() => setAnchor(startOfWeek(new Date()))}>
                        This week
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-7 gap-3 relative">
                {loading && (
                    <div className="absolute inset-0 z-10 bg-white/60 flex items-center justify-center rounded-xl">
                        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
                {weekDays.map((day) => {
                    const key = toDateKey(day);
                    const dayItems = byDay.get(key) ?? [];
                    const isToday = key === toDateKey(new Date());

                    return (
                        <Card key={key} className={`border-slate-200 min-h-[220px] ${isToday ? 'ring-1 ring-blue-200' : ''}`}>
                            <p className={`text-[10px] font-bold uppercase tracking-widest ${isToday ? 'text-blue-600' : 'text-slate-400'}`}>
                                {day.toLocaleDateString('default', { weekday: 'short' })}
                            </p>
                            <p className="text-lg font-bold text-slate-800 mb-3">{day.getDate()}</p>
                            <div className="space-y-2">
                                {dayItems.length === 0 ? (
                                    <p className="text-xs text-slate-400">No one out</p>
                                ) : (
                                    dayItems.map((item) => (
                                        <div
                                            key={`${item.id}-${key}`}
                                            className={`rounded-lg px-2 py-1.5 text-xs ${
                                                item.status === 'approved'
                                                    ? 'bg-emerald-50 text-emerald-700'
                                                    : 'bg-amber-50 text-amber-700'
                                            }`}
                                        >
                                            <p className="font-bold truncate">{item.user?.name}</p>
                                            <p className="opacity-80 truncate">{item.leavePolicy?.name}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
