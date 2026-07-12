import { useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Pause, Play, Square, TimerReset } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import ModalConfirmation from '@/components/modals/ModalConfirmation';
import type { AttendanceTimerState } from '@/types';

interface Props {
    timer: AttendanceTimerState;
    displayMs: number;
    remainingMs: number;
    canEnd: boolean;
    canStop: boolean;
    canContinue: boolean;
    isCompletedToday?: boolean;
    loading?: boolean;
    actionLoading?: boolean;
    onStart: () => Promise<unknown>;
    onPause: () => Promise<unknown>;
    onResume: () => Promise<unknown>;
    onEnd: () => Promise<unknown>;
    onContinue: () => Promise<unknown>;
}

function formatClock(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [hours, minutes, seconds].map((v) => String(v).padStart(2, '0')).join(':');
}

function formatHoursLabel(ms: number): string {
    const totalMinutes = Math.floor(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours <= 0) return `${minutes}m`;
    return `${hours}h ${String(minutes).padStart(2, '0')}m`;
}

function formatTimeLabel(time?: string | null): string {
    if (!time) return '--:--';
    const [h, m] = time.slice(0, 5).split(':').map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return time.slice(0, 5);
    const date = new Date();
    date.setHours(h, m, 0, 0);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

const statusLabel: Record<string, string> = {
    working: 'Working',
    paused: 'Paused',
    offline: 'Not started',
};

export default function MyAttendanceTimer({
    timer,
    displayMs,
    remainingMs,
    canEnd,
    canStop,
    canContinue,
    isCompletedToday,
    loading,
    actionLoading,
    onStart,
    onPause,
    onResume,
    onEnd,
    onContinue,
}: Props) {
    const [isStopConfirmOpen, setIsStopConfirmOpen] = useState(false);
    const [isStopping, setIsStopping] = useState(false);

    const status = timer.timerStatus;
    const schedule = timer.schedule;
    const requiredMs = schedule?.requiredMs ?? 0;
    const progress = requiredMs > 0 ? Math.min(100, (displayMs / requiredMs) * 100) : 0;
    const isEarlyStop = requiredMs > 0 && displayMs < requiredMs;

    const stopConfirmMessage = useMemo(() => {
        const worked = formatHoursLabel(displayMs);
        const required = formatHoursLabel(requiredMs);

        if (isEarlyStop) {
            return `You've only worked ${worked} so far (required: ${required}). Stopping early will end attendance for this shift day. If this was accidental, you can continue today only — not tomorrow. Are you sure you want to stop?`;
        }

        return `You've worked ${worked} today. Stop attendance for this shift day? If you stop by mistake, you can continue today only — not on the next day.`;
    }, [displayMs, requiredMs, isEarlyStop]);

    const handleConfirmStop = async () => {
        setIsStopping(true);
        try {
            await onEnd();
            setIsStopConfirmOpen(false);
        } catch {
            // toast handled in hook
        } finally {
            setIsStopping(false);
        }
    };

    return (
        <Card className="relative flex h-full flex-col overflow-hidden border-slate-200">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.08),_transparent_45%)]" />
            <div className="relative z-10 flex min-h-0 flex-1 flex-col justify-between gap-6">
                <div className="space-y-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">My Attendance</h2>
                            <p className="mt-1 text-sm text-slate-400">
                                Based on your schedule. Lunch break is excluded from required work time.
                            </p>
                        </div>
                        <span className={`rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${
                            isCompletedToday
                                ? 'bg-emerald-50 text-emerald-600'
                                : status === 'working'
                                    ? 'bg-emerald-50 text-emerald-600'
                                    : status === 'paused'
                                        ? 'bg-amber-50 text-amber-600'
                                        : 'bg-slate-100 text-slate-500'
                        }`}>
                            {isCompletedToday ? 'Stopped' : (statusLabel[status] || status)}
                        </span>
                    </div>

                    {schedule && (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Schedule</p>
                                <p className="mt-1 text-sm font-bold text-slate-700">
                                    {schedule.isRestDay
                                        ? 'Rest day'
                                        : `${formatTimeLabel(schedule.shiftStart)} – ${formatTimeLabel(schedule.shiftEnd)}`}
                                </p>
                            </div>
                            <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Break</p>
                                <p className="mt-1 text-sm font-bold text-slate-700">{schedule.breakMinutes} min</p>
                            </div>
                            <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Required</p>
                                <p className="mt-1 text-sm font-bold text-slate-700">
                                    {schedule.isRestDay ? 'None' : formatHoursLabel(requiredMs)}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="py-2 text-center">
                        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                            Today&apos;s time
                        </p>
                        <p className={`font-mono text-5xl font-black tracking-tight tabular-nums md:text-6xl ${
                            status === 'working' ? 'text-slate-900' : 'text-slate-700'
                        }`}>
                            {loading ? '--:--:--' : formatClock(displayMs)}
                        </p>
                        {timer.attendance?.startedAt && (
                            <p className="mt-3 text-xs text-slate-400">
                                Started at {new Date(timer.attendance.startedAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </p>
                        )}
                    </div>

                    {!schedule?.isRestDay && requiredMs > 0 && !isCompletedToday && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs font-bold">
                                <span className="uppercase tracking-wider text-slate-500">Remaining</span>
                                <span className={`tabular-nums ${remainingMs === 0 ? 'text-emerald-600' : 'text-slate-700'}`}>
                                    {remainingMs === 0 ? 'Done' : formatClock(remainingMs)}
                                </span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                <div
                                    className={`h-full transition-all duration-300 ${remainingMs === 0 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3">
                    {status === 'offline' && !isCompletedToday && (
                        <Button
                            icon={Play}
                            loading={actionLoading}
                            onClick={() => onStart()}
                            className="min-w-[160px] justify-center"
                        >
                            Start time
                        </Button>
                    )}

                    {status === 'working' && (
                        <Button
                            icon={Pause}
                            variant="secondary"
                            loading={actionLoading}
                            onClick={() => onPause()}
                            className="min-w-[140px] justify-center"
                        >
                            Pause
                        </Button>
                    )}

                    {status === 'paused' && (
                        <Button
                            icon={Play}
                            loading={actionLoading}
                            onClick={() => onResume()}
                            className="min-w-[140px] justify-center"
                        >
                            Resume
                        </Button>
                    )}

                    {canStop && (
                        <Button
                            icon={Square}
                            variant="danger"
                            loading={actionLoading}
                            onClick={() => setIsStopConfirmOpen(true)}
                            className="min-w-[140px] justify-center"
                        >
                            {canEnd ? 'Stop' : 'Stop early'}
                        </Button>
                    )}

                    {isCompletedToday && canContinue && (
                        <div className="flex w-full flex-col items-center gap-3">
                            <p className="max-w-md text-center text-sm font-medium text-slate-500">
                                Attendance stopped for this shift day ({formatHoursLabel(displayMs)} recorded).
                                If you stopped by mistake, you can continue — only today. Tomorrow you will need to start a new timer.
                            </p>
                            <Button
                                icon={Play}
                                loading={actionLoading}
                                onClick={() => onContinue()}
                                className="min-w-[180px] justify-center"
                            >
                                Continue time
                            </Button>
                        </div>
                    )}

                    {status !== 'offline' && (
                        <div className="flex items-center gap-2 px-2 text-xs font-medium text-slate-400">
                            <TimerReset size={14} />
                            Live across your open sessions
                        </div>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {isStopConfirmOpen && (
                    <ModalConfirmation
                        isOpen={isStopConfirmOpen}
                        onClose={() => {
                            if (isStopping) return;
                            setIsStopConfirmOpen(false);
                        }}
                        onConfirm={handleConfirmStop}
                        loading={isStopping}
                        title={isEarlyStop ? 'Stop early?' : 'Stop attendance?'}
                        message={stopConfirmMessage}
                        confirmText="Yes, stop"
                        variant="warning"
                    />
                )}
            </AnimatePresence>
        </Card>
    );
}
