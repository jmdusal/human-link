import { useCallback, useEffect, useState } from 'react';
import { AttendanceService } from '@/services/AttendanceService';
import type { Attendance } from '@/types';

export const useAttendances = (shouldFetch: boolean, start?: string, end?: string) => {
    const [attendances, setAttendances] = useState<Attendance[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchAttendances = useCallback(async () => {
        if (!shouldFetch) return;
        setLoading(true);
        try {
            const data = await AttendanceService.list({ start, end });
            setAttendances(data);
        } catch (error) {
            console.error('Attendance list error:', error);
        } finally {
            setLoading(false);
        }
    }, [shouldFetch, start, end]);

    useEffect(() => {
        fetchAttendances();
    }, [fetchAttendances]);

    return {
        attendances,
        loading,
        setAttendances,
        fetchAttendances,
    };
};
