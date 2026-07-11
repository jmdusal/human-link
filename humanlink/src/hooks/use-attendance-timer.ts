import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { AttendanceService } from '@/services/AttendanceService';
import { echo } from '@/lib/echo';
import { useAuth } from '@/context/AuthContext';
import type { AttendanceTimerState } from '@/types';

const CHANNEL_NAME = 'humanlink-attendance-timer';

const emptyTimer = (): AttendanceTimerState => ({
    timerStatus: 'offline',
    timerStartedAt: null,
    timerAccumulatedMs: 0,
    elapsedMs: 0,
    attendance: null,
    schedule: null,
});

function applyTimerState(
    incoming: AttendanceTimerState,
    setTimer: (value: AttendanceTimerState) => void,
    setDisplayMs: (value: number) => void,
) {
    setTimer(incoming);
    setDisplayMs(incoming.elapsedMs);
}

export const useAttendanceTimer = (enabled: boolean) => {
    const { user } = useAuth();
    const [timer, setTimer] = useState<AttendanceTimerState>(emptyTimer());
    const [displayMs, setDisplayMs] = useState(0);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const tabIdRef = useRef(`tab-${Math.random().toString(36).slice(2)}`);
    const channelRef = useRef<BroadcastChannel | null>(null);
    const applyingRemoteRef = useRef(false);

    const broadcastLocal = useCallback((state: AttendanceTimerState) => {
        channelRef.current?.postMessage({
            type: 'timer-sync',
            source: tabIdRef.current,
            state,
        });
    }, []);

    const syncFromServer = useCallback(async () => {
        if (!enabled) return;
        setLoading(true);
        try {
            const state = await AttendanceService.status();
            applyingRemoteRef.current = true;
            applyTimerState(state, setTimer, setDisplayMs);
            broadcastLocal(state);
        } catch (error) {
            console.error('Attendance status error:', error);
        } finally {
            applyingRemoteRef.current = false;
            setLoading(false);
        }
    }, [enabled, broadcastLocal]);

    const runAction = useCallback(async (action: 'start' | 'pause' | 'resume' | 'end') => {
        setActionLoading(true);
        try {
            let state: AttendanceTimerState;

            if (action === 'start') {
                state = await AttendanceService.start();
            } else if (action === 'pause') {
                state = await AttendanceService.pause();
            } else if (action === 'resume') {
                state = await AttendanceService.resume();
            } else {
                state = await AttendanceService.end();
            }

            applyingRemoteRef.current = true;
            applyTimerState(state, setTimer, setDisplayMs);
            broadcastLocal(state);
            if (action === 'end') {
                toast.success('Attendance ended for today.');
            }
            return state;
        } catch (error: any) {
            const message =
                error?.response?.data?.message
                || error?.response?.data?.errors?.timer?.[0]
                || `Failed to ${action} timer`;
            toast.error(message);
            throw error;
        } finally {
            applyingRemoteRef.current = false;
            setActionLoading(false);
        }
    }, [broadcastLocal]);

    useEffect(() => {
        if (!enabled) return;
        syncFromServer();
    }, [enabled, syncFromServer]);

    useEffect(() => {
        if (!enabled || typeof BroadcastChannel === 'undefined') return;

        const channel = new BroadcastChannel(CHANNEL_NAME);
        channelRef.current = channel;

        channel.onmessage = (event) => {
            const payload = event.data;
            if (!payload || payload.source === tabIdRef.current) return;
            if (payload.type !== 'timer-sync' || !payload.state) return;

            applyingRemoteRef.current = true;
            applyTimerState(payload.state as AttendanceTimerState, setTimer, setDisplayMs);
            applyingRemoteRef.current = false;
        };

        return () => {
            channel.close();
            channelRef.current = null;
        };
    }, [enabled]);

    useEffect(() => {
        if (!enabled || !user?.id) return;

        const channelName = `App.Models.User.${user.id}`;

        try {
            echo.private(channelName)
                .listen('.attendance.timer.updated', (payload: AttendanceTimerState) => {
                    if (applyingRemoteRef.current) return;
                    applyingRemoteRef.current = true;
                    applyTimerState(payload, setTimer, setDisplayMs);
                    broadcastLocal(payload);
                    applyingRemoteRef.current = false;
                });
        } catch (error) {
            console.error('Attendance echo subscribe error:', error);
        }

        const pollId = window.setInterval(() => {
            AttendanceService.status()
                .then((state) => {
                    setTimer((current) => {
                        const changed =
                            current.timerStatus !== state.timerStatus
                            || current.timerStartedAt !== state.timerStartedAt
                            || current.timerAccumulatedMs !== state.timerAccumulatedMs
                            || current.schedule?.remainingMs !== state.schedule?.remainingMs
                            || current.schedule?.canEnd !== state.schedule?.canEnd;

                        if (!changed) return current;

                        setDisplayMs(state.elapsedMs);
                        broadcastLocal(state);
                        return state;
                    });
                })
                .catch(() => undefined);
        }, 5000);

        return () => {
            window.clearInterval(pollId);
            try {
                echo.leave(channelName);
            } catch {
                // ignore
            }
        };
    }, [enabled, user?.id, broadcastLocal]);

    useEffect(() => {
        if (!enabled || timer.timerStatus !== 'working' || !timer.timerStartedAt) {
            setDisplayMs(timer.elapsedMs);
            return;
        }

        const startedAt = new Date(timer.timerStartedAt).getTime();
        const base = timer.timerAccumulatedMs;

        const tick = () => {
            setDisplayMs(base + Math.max(0, Date.now() - startedAt));
        };

        tick();
        const id = window.setInterval(tick, 250);
        return () => window.clearInterval(id);
    }, [enabled, timer.timerStatus, timer.timerStartedAt, timer.timerAccumulatedMs, timer.elapsedMs]);

    const remainingMs = useMemo(() => {
        const required = timer.schedule?.requiredMs ?? 0;
        return Math.max(0, required - displayMs);
    }, [timer.schedule?.requiredMs, displayMs]);

    const canEnd = useMemo(() => {
        const required = timer.schedule?.requiredMs ?? 0;
        const active = timer.timerStatus === 'working' || timer.timerStatus === 'paused';
        return active && required > 0 && displayMs >= required;
    }, [timer.schedule?.requiredMs, timer.timerStatus, displayMs]);

    const isCompletedToday = timer.attendance?.status === 'completed' && timer.timerStatus === 'offline';

    return {
        timer,
        displayMs,
        remainingMs,
        canEnd,
        isCompletedToday,
        loading,
        actionLoading,
        refresh: syncFromServer,
        start: () => runAction('start'),
        pause: () => runAction('pause'),
        resume: () => runAction('resume'),
        end: () => runAction('end'),
    };
};
