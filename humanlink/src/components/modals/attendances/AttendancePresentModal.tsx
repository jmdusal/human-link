import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { MapPin, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { getInitials } from '@/utils/userUtils';
import type { Attendance } from '@/types';

const AttendancePresentMap = lazy(() => import('@/components/features/attendances/AttendancePresentMap'));

interface Props {
    isOpen: boolean;
    onClose: () => void;
    dateLabel: string;
    attendances: Attendance[];
}

function formatDuration(ms: number): string {
    const totalSeconds = Math.floor(Math.max(0, ms) / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}h ${String(minutes).padStart(2, '0')}m`;
}

function formatTime(value?: string | null): string {
    if (!value) return '—';
    return new Date(value).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function AttendancePresentModal({
    isOpen,
    onClose,
    dateLabel,
    attendances,
}: Props) {
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const sorted = useMemo(() => {
        return [...attendances].sort((a, b) => {
            const aTime = a.startedAt ? new Date(a.startedAt).getTime() : 0;
            const bTime = b.startedAt ? new Date(b.startedAt).getTime() : 0;
            return aTime - bTime;
        });
    }, [attendances]);

    useEffect(() => {
        setSelectedId(sorted[0]?.id ?? null);
    }, [sorted]);

    useEffect(() => {
        if (!isOpen) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isOpen]);

    const selected = sorted.find((item) => item.id === selectedId) ?? sorted[0] ?? null;
    const activeId = selected?.id ?? null;

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[200] flex h-[100dvh] w-screen items-center justify-center overflow-hidden p-3 sm:p-6">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/50"
                onClick={onClose}
            />
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                className="relative flex max-h-[min(880px,calc(100dvh-2rem))] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
            >
                <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
                    <div className="min-w-0">
                        <h2 className="text-lg font-bold text-slate-800 sm:text-xl">
                            Present on {dateLabel}
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-400 sm:text-sm">
                            {sorted.length === 0
                                ? 'No one present on this day.'
                                : `${sorted.length} user${sorted.length === 1 ? '' : 's'} started attendance.`}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md p-2 text-slate-400 hover:bg-slate-50"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="min-h-0 flex-1 overflow-auto">
                    <div className="grid grid-cols-1 gap-5 p-4 sm:p-6 lg:grid-cols-[minmax(280px,0.9fr)_minmax(0,1.3fr)]">
                        <div className="space-y-3">
                            {sorted.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm font-medium text-slate-400">
                                    No attendance records for this date.
                                </div>
                            ) : (
                                sorted.map((item) => {
                                    const isActive = item.id === activeId;
                                    const hasLocation = item.startLatitude != null && item.startLongitude != null;

                                    return (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => setSelectedId(item.id)}
                                            className={`flex w-full items-center justify-between gap-3 rounded-xl border p-3.5 text-left transition-colors ${
                                                isActive
                                                    ? 'border-blue-200 bg-blue-50/70'
                                                    : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'
                                            }`}
                                        >
                                            <div className="flex min-w-0 items-center gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[10px] font-bold uppercase text-blue-700">
                                                    {getInitials(item.user?.name || '?')}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-bold text-slate-800">
                                                        {item.user?.name || 'Unknown'}
                                                    </p>
                                                    <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">
                                                        <MapPin size={11} className={hasLocation ? 'text-blue-500' : 'text-slate-300'} />
                                                        {hasLocation ? 'Location captured' : 'No location'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="shrink-0 text-right">
                                                <p className="text-sm font-bold tabular-nums text-slate-700">
                                                    {formatDuration(item.totalMs)}
                                                </p>
                                                <p className="text-[10px] text-slate-400">
                                                    In {formatTime(item.startedAt)}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>

                        <div className="space-y-4">
                            <Suspense
                                fallback={
                                    <div className="flex h-64 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-400 sm:h-72">
                                        Loading map...
                                    </div>
                                }
                            >
                                <AttendancePresentMap
                                    attendances={sorted}
                                    selectedId={activeId}
                                    onSelect={setSelectedId}
                                    heightClassName="h-64 sm:h-72"
                                />
                            </Suspense>

                            {selected && (
                                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                        Selected
                                    </p>
                                    <p className="mt-1 text-base font-bold text-slate-800">
                                        {selected.user?.name || 'Unknown'}
                                    </p>
                                    <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-slate-500 sm:grid-cols-4">
                                        <div>
                                            <span className="text-slate-400">Started</span>
                                            <p className="mt-0.5 font-semibold text-slate-700">{formatTime(selected.startedAt)}</p>
                                        </div>
                                        <div>
                                            <span className="text-slate-400">Ended</span>
                                            <p className="mt-0.5 font-semibold text-slate-700">{formatTime(selected.endedAt)}</p>
                                        </div>
                                        <div>
                                            <span className="text-slate-400">Total</span>
                                            <p className="mt-0.5 font-semibold text-slate-700">{formatDuration(selected.totalMs)}</p>
                                        </div>
                                        <div>
                                            <span className="text-slate-400">Status</span>
                                            <p className="mt-0.5 font-semibold capitalize text-slate-700">{selected.status}</p>
                                        </div>
                                    </div>
                                    {selected.startLatitude != null && selected.startLongitude != null && (
                                        <p className="mt-3 text-[11px] tabular-nums text-slate-400">
                                            {selected.startLatitude.toFixed(5)}, {selected.startLongitude.toFixed(5)}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>,
        document.body,
    );
}
