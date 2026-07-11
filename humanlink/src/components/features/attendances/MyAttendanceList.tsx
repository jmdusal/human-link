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
        <Card className="border-slate-200 !p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-800">Attendance records</h3>
                <p className="text-xs text-slate-400 mt-0.5">Days you were present this month.</p>
            </div>

            {loading ? (
                <div className="px-6 py-10 text-center text-sm text-slate-400 font-medium">
                    Loading records...
                </div>
            ) : rows.length === 0 ? (
                <div className="px-6 py-10 text-center text-sm text-slate-400 font-medium">
                    No attendance records yet.
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/70">
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Date</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Started</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Ended</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Total</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Flags</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                                {onDispute && (
                                    <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">
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
                                                <div className="text-[10px] font-bold uppercase tracking-wider text-blue-500 mt-0.5">
                                                    Today
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-3.5 text-sm font-medium text-slate-600 tabular-nums">
                                            {formatTime(item.startedAt)}
                                        </td>
                                        <td className="px-6 py-3.5 text-sm font-medium text-slate-600 tabular-nums">
                                            {formatTime(item.endedAt)}
                                        </td>
                                        <td className="px-6 py-3.5 text-sm font-bold text-slate-700 tabular-nums">
                                            {formatDuration(totalMs)}
                                        </td>
                                        <td className="px-6 py-3.5">
                                            <div className="flex flex-wrap gap-1">
                                                {(item.lateMs ?? 0) > 0 && (
                                                    <span className="inline-flex text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-rose-50 text-rose-600">
                                                        Late
                                                    </span>
                                                )}
                                                {(item.overtimeMs ?? 0) > 0 && (
                                                    <span className="inline-flex text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600">
                                                        OT
                                                    </span>
                                                )}
                                                {(item.undertimeMs ?? 0) > 0 && item.status === 'completed' && (
                                                    <span className="inline-flex text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-50 text-amber-600">
                                                        UT
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-3.5">
                                            <span className={`inline-flex text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-lg ${statusStyles(item.status)}`}>
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
