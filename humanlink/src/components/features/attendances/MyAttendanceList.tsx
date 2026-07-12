import Card from '@/components/ui/Card';
import { formatISODate, formatSimpleDate } from '@/utils/dateUtils';
import type { Attendance } from '@/types';

interface Props {
    data: Attendance[];
    loading?: boolean;
    liveElapsedMs?: number;
    onDispute?: (attendance: Attendance) => void;
}

function formatDuration(ms: number): string {
    const totalSeconds = Math.floor(Math.max(0, ms) / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
}

function formatTime(value?: string | null): string {
    if (!value) return '—';
    return new Date(value).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    });
}

function statusStyles(status: Attendance['status']): string {
    if (status === 'working') return 'bg-emerald-50 text-emerald-600';
    if (status === 'paused') return 'bg-amber-50 text-amber-600';
    return 'bg-slate-100 text-slate-600';
}

export default function MyAttendanceList({ data, loading, liveElapsedMs, onDispute }: Props) {
    const todayKey = formatISODate(new Date());

    const rows = [...data].sort((a, b) => {
        const aKey = /^\d{4}-\d{2}-\d{2}$/.test(a.date) ? a.date : formatISODate(a.date);
        const bKey = /^\d{4}-\d{2}-\d{2}$/.test(b.date) ? b.date : formatISODate(b.date);
        return bKey.localeCompare(aKey);
    });

    return (
        <Card className="flex w-full flex-col overflow-hidden border-slate-200 !p-0">
            <div className="shrink-0 border-b border-slate-100 px-6 py-4">
                <h3 className="text-sm font-bold text-slate-800">Attendance records</h3>
                <p className="mt-0.5 text-xs text-slate-400">Days you were present this month.</p>
            </div>

            {loading ? (
                <div className="flex flex-1 items-center justify-center px-6 py-10 text-center text-sm font-medium text-slate-400">
                    Loading records...
                </div>
            ) : rows.length === 0 ? (
                <div className="flex flex-1 items-center justify-center px-6 py-10 text-center text-sm font-medium text-slate-400">
                    No attendance records yet.
                </div>
            ) : (
                <div className="max-h-[min(560px,70vh)] overflow-auto">
                    <table className="w-full min-w-[640px] text-left">
                        <thead className="sticky top-0 z-10">
                            <tr className="border-b border-slate-100 bg-slate-50/95 backdrop-blur-sm">
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Date</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Started</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Ended</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Total</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Flags</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                                {onDispute && (
                                    <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                        Actions
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((item) => {
                                const dateKey = /^\d{4}-\d{2}-\d{2}$/.test(item.date)
                                    ? item.date
                                    : formatISODate(item.date);
                                const isToday = dateKey === todayKey;
                                const totalMs = isToday && liveElapsedMs != null && item.status !== 'completed'
                                    ? liveElapsedMs
                                    : item.totalMs;

                                return (
                                    <tr
                                        key={item.id}
                                        className={`border-b border-slate-50 last:border-0 ${isToday ? 'bg-blue-50/40' : 'bg-white'}`}
                                    >
                                        <td className="px-6 py-3.5">
                                            <div className="text-sm font-bold text-slate-800">
                                                {formatSimpleDate(dateKey)}
                                            </div>
                                            {isToday && (
                                                <div className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-500">
                                                    Today
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-3.5 text-sm font-medium tabular-nums text-slate-600">
                                            {formatTime(item.startedAt)}
                                        </td>
                                        <td className="px-6 py-3.5 text-sm font-medium tabular-nums text-slate-600">
                                            {formatTime(item.endedAt)}
                                        </td>
                                        <td className="px-6 py-3.5 text-sm font-bold tabular-nums text-slate-700">
                                            {formatDuration(totalMs)}
                                        </td>
                                        <td className="px-6 py-3.5">
                                            <div className="flex flex-wrap gap-1">
                                                {(item.lateMs ?? 0) > 0 && (
                                                    <span className="inline-flex rounded bg-rose-50 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-rose-600">
                                                        Late
                                                    </span>
                                                )}
                                                {(item.overtimeMs ?? 0) > 0 && (
                                                    <span className="inline-flex rounded bg-indigo-50 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-indigo-600">
                                                        OT
                                                    </span>
                                                )}
                                                {(item.undertimeMs ?? 0) > 0 && item.status === 'completed' && (
                                                    <span className="inline-flex rounded bg-amber-50 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-600">
                                                        UT
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-3.5">
                                            <span className={`inline-flex rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-wider ${statusStyles(item.status)}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        {onDispute && (
                                            <td className="px-6 py-3.5 text-right">
                                                {item.status === 'completed' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => onDispute(item)}
                                                        className="text-[11px] font-bold uppercase tracking-wider text-blue-600 hover:text-blue-700"
                                                    >
                                                        Dispute
                                                    </button>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </Card>
    );
}
