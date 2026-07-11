import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useAttendanceTimer } from '@/hooks/use-attendance-timer';
import { useAttendances } from '@/hooks/use-attendances';
import AttendanceCalendar from '@/components/features/attendances/AttendanceCalendar';
import AttendanceLocationMap from '@/components/features/attendances/AttendanceLocationMap';
import MyAttendanceTimer from '@/components/features/attendances/MyAttendanceTimer';
import MyAttendanceList from '@/components/features/attendances/MyAttendanceList';
import type { Attendance } from '@/types';

function localDateKey(year: number, monthIndex: number, day: number): string {
    return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function AttendanceIndex() {
    const { can, hasRole } = useAuth();
    const isAdminView = hasRole('super-admin') || hasRole('hr-manager') || can('users-edit');

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null);
    const [dayAttendances, setDayAttendances] = useState<Attendance[]>([]);

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
        isCompletedToday,
        loading: timerLoading,
        actionLoading,
        start,
        pause,
        resume,
        end,
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

    const mapAttendances = useMemo(() => {
        if (selectedAttendance) return [selectedAttendance];
        if (dayAttendances.length > 0) return dayAttendances;
        return attendances;
    }, [attendances, selectedAttendance, dayAttendances]);

    const handleDayAttendancesChange = useCallback((rows: Attendance[]) => {
        setDayAttendances(rows);
        setSelectedAttendance(null);
    }, []);

    if (!isAdminView) {
        return (
            <div className="w-full max-w-3xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">My Attendance</h1>
                    <p className="text-sm text-slate-500 mt-1">Track and control your work time for today.</p>
                </div>
                <MyAttendanceTimer
                    timer={timer}
                    displayMs={displayMs}
                    remainingMs={remainingMs}
                    canEnd={canEnd}
                    isCompletedToday={isCompletedToday}
                    loading={timerLoading}
                    actionLoading={actionLoading}
                    onStart={start}
                    onPause={pause}
                    onResume={resume}
                    onEnd={end}
                />
                <MyAttendanceList
                    data={attendances}
                    loading={listLoading}
                    liveElapsedMs={displayMs}
                />
            </div>
        );
    }

    return (
        <div className="w-full space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Attendance</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Calendar of presence with clock locations on the map.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="secondary"
                        icon={ChevronLeft}
                        onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                    />
                    <div className="min-w-[160px] text-center text-sm font-bold text-slate-700">
                        {monthLabel}
                    </div>
                    <Button
                        variant="secondary"
                        icon={ChevronRight}
                        onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                    />
                    <Button
                        variant="outline"
                        onClick={() => setCurrentDate(new Date())}
                    >
                        Today
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_0.85fr] gap-6 items-start">
                <AttendanceCalendar
                    data={attendances}
                    currentDate={currentDate}
                    loading={listLoading}
                    onSelectAttendance={setSelectedAttendance}
                    onDayAttendancesChange={handleDayAttendancesChange}
                />
                <AttendanceLocationMap
                    attendances={mapAttendances}
                    selectedAttendanceId={selectedAttendance?.id}
                    onSelect={setSelectedAttendance}
                />
            </div>
        </div>
    );
}
