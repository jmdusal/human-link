export type TimerStatus = 'working' | 'paused' | 'offline';

export interface AttendanceUser {
    id: number;
    name: string;
    email?: string;
    timerStatus?: TimerStatus;
}

export interface AttendanceBreak {
    id: number;
    attendanceId: number;
    pausedAt: string;
    resumedAt: string | null;
    durationMs: number;
}

export interface Attendance {
    id: number;
    userId: number;
    date: string;
    startedAt: string | null;
    endedAt: string | null;
    totalMs: number;
    lateMs?: number;
    undertimeMs?: number;
    overtimeMs?: number;
    breakMs?: number;
    requiredMs?: number;
    scheduledStart?: string | null;
    scheduledEnd?: string | null;
    startIp?: string | null;
    endIp?: string | null;
    startLatitude?: number | string | null;
    startLongitude?: number | string | null;
    endLatitude?: number | string | null;
    endLongitude?: number | string | null;
    status: 'working' | 'paused' | 'completed';
    user?: AttendanceUser;
    breaks?: AttendanceBreak[];
    createdAt?: string;
    updatedAt?: string;
}

export interface AttendanceScheduleMeta {
    shiftStart: string;
    shiftEnd: string;
    breakMinutes: number;
    isRestDay: boolean;
    requiredMs: number;
    remainingMs: number;
    canEnd: boolean;
}

export interface AttendanceLocationPayload {
    latitude?: number | null;
    longitude?: number | null;
}

export interface AttendanceTimerState {
    timerStatus: TimerStatus;
    timerStartedAt: string | null;
    timerAccumulatedMs: number;
    elapsedMs: number;
    serverTime?: string;
    attendance: Attendance | null;
    schedule?: AttendanceScheduleMeta | null;
}
