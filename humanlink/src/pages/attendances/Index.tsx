import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useAttendanceTimer } from '@/hooks/use-attendance-timer';
import { useAttendances } from '@/hooks/use-attendances';
import AttendanceCalendar from '@/components/features/attendances/AttendanceCalendar';
import AttendanceDisputesPanel from '@/components/features/attendances/AttendanceDisputesPanel';
import MyAttendanceTimer from '@/components/features/attendances/MyAttendanceTimer';
import MyAttendanceList from '@/components/features/attendances/MyAttendanceList';
import AttendanceDisputeModal from '@/components/modals/attendances/AttendanceDisputeModal';
import type { Attendance } from '@/types';

function localDateKey(year: number, monthIndex: number, day: number): string {
    return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function AttendanceIndex() {
    const { hasRole, user } = useAuth();
    const isHrUserType = (user?.userType ?? '').toLowerCase() === 'hr'
        || user?.accessScope === 'company';
    const isAdminView = hasRole('super-admin') || isHrUserType;

    const [currentDate, setCurrentDate] = useState(new Date());
    const [disputeAttendance, setDisputeAttendance] = useState<Attendance | null>(null);
    const [isDisputeOpen, setIsDisputeOpen] = useState(false);

    const range = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const lastDay = new Date(year, month + 1, 0).getDate();
        return {
            start: localDateKey(year, month, 1),
            end: localDateKey(year, month, lastDay),
        };
    }, [currentDate]);

    const employeeRange = useMemo(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const lastDay = new Date(year, month + 1, 0).getDate();
        return {
            start: localDateKey(year, month, 1),
            end: localDateKey(year, month, lastDay),
        };
    }, []);

    const { attendances, loading: listLoading, fetchAttendances } = useAttendances(
        true,
        isAdminView ? range.start : employeeRange.start,
        isAdminView ? range.end : employeeRange.end,
    );

    const {
        timer,
        displayMs,
        remainingMs,
        canEnd,
        canStop,
        canContinue,
        isCompletedToday,
        loading: timerLoading,
        actionLoading,
        start,
        pause,
        resume,
        end,
        continue: continueTime,
    } = useAttendanceTimer(!isAdminView);

    useEffect(() => {
        if (isAdminView) return;
        if (!timer.attendance) return;
        fetchAttendances();
    }, [
        isAdminView,
        timer.attendance?.id,
        timer.attendance?.status,
        timer.attendance?.totalMs,
        timer.timerStatus,
        fetchAttendances,
    ]);

    const monthLabel = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    const openDispute = (attendance: Attendance) => {
        setDisputeAttendance(attendance);
        setIsDisputeOpen(true);
    };

    if (!isAdminView) {
        return (
            <div className="w-full space-y-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">My Attendance</h1>
                    <p className="text-sm text-slate-500 mt-1">Track and control your work time for today.</p>
                </div>

                <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-2">
                    <MyAttendanceTimer
                        timer={timer}
                        displayMs={displayMs}
                        remainingMs={remainingMs}
                        canEnd={canEnd}
                        canStop={canStop}
                        canContinue={canContinue}
                        isCompletedToday={isCompletedToday}
                        loading={timerLoading}
                        actionLoading={actionLoading}
                        onStart={start}
                        onPause={pause}
                        onResume={resume}
                        onEnd={end}
                        onContinue={continueTime}
                    />
                    <MyAttendanceList
                        data={attendances}
                        loading={listLoading}
                        liveElapsedMs={displayMs}
                        onDispute={openDispute}
                    />
                </div>

                <AnimatePresence>
                    {isDisputeOpen && (
                        <AttendanceDisputeModal
                            isOpen={isDisputeOpen}
                            onClose={() => {
                                setIsDisputeOpen(false);
                                setDisputeAttendance(null);
                            }}
                            attendance={disputeAttendance}
                        />
                    )}
                </AnimatePresence>
            </div>
        );
    }

    return (
        <div className="w-full space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-800">Attendance</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Calendar of employee presence for the selected month.
                    </p>
                </div>

                <div className="flex items-center gap-1 rounded-xl border border-slate-200/80 bg-white p-1 shadow-sm">
                    <Button
                        variant="secondary"
                        icon={ChevronLeft}
                        onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                        className="!border-0 !bg-transparent !shadow-none hover:!bg-blue-50 hover:!text-blue-700"
                    />
                    <div className="min-w-[148px] px-2 text-center text-sm font-bold text-slate-800">
                        {monthLabel}
                    </div>
                    <Button
                        variant="secondary"
                        icon={ChevronRight}
                        onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                        className="!border-0 !bg-transparent !shadow-none hover:!bg-blue-50 hover:!text-blue-700"
                    />
                    <div className="mx-1 h-6 w-px bg-slate-200" />
                    <Button
                        onClick={() => setCurrentDate(new Date())}
                        className="!min-w-0 !rounded-lg !px-3 !py-1.5 !text-xs"
                    >
                        Today
                    </Button>
                </div>
            </div>

            <AttendanceCalendar
                data={attendances}
                currentDate={currentDate}
                loading={listLoading}
            />

            <AttendanceDisputesPanel />
        </div>
    );
}
