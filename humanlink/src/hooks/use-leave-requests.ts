import { useState, useEffect, useCallback } from 'react';
import { LeaveRequestService } from '@/services/LeaveRequestService';
import type { LeaveRequest } from '@/types/LeaveRequest';

export const useLeaveRequests = (shouldFetch: boolean) => {
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchLeaveRequests = useCallback(async () => {
        setLoading(true);
        try {
            const data = await LeaveRequestService.getAllLeaveRequests();
            setLeaveRequests(data);
        } catch (err) {
            console.error('Leave Request Load Error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (shouldFetch) {
            fetchLeaveRequests();
        }
    }, [shouldFetch, fetchLeaveRequests]);

    return {
        leaveRequests,
        loading,
        setLeaveRequests,
        fetchLeaveRequests,
    };
};
