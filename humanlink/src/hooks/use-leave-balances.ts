import { useState, useEffect, useCallback } from 'react';
import { LeaveBalanceService } from '@/services/LeaveBalanceService';
import type { LeaveBalance } from '@/types';


export const useLeaveBalances = (shouldFetch: boolean) => {
    const [leavebalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
    const [loading, setLoading] = useState(false);
    
    const fetchLeaveBalances = useCallback(async () => {
        setLoading(true);
        try {
            const data = await LeaveBalanceService.getAllLeaveBalances();
            setLeaveBalances(data);
        } catch (err) {
            console.error("Leave Balance Load Error:", err);
        } finally {
            setLoading(false);
        }
    }, []);
    
    useEffect(() => {
        if (shouldFetch) {
            fetchLeaveBalances();
        }
    }, [shouldFetch, fetchLeaveBalances]);
    
    return { 
        leavebalances,
        loading,
        setLeaveBalances,
        fetchLeaveBalances
    };
}