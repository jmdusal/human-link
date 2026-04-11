import { useState, useEffect, useCallback } from 'react';
import { LeavePolicyService } from '@/services/LeavePolicyService';
import type { LeavePolicy } from '@/types';

export const useLeavePolicies = (shouldFetch: boolean) => {
    const [leavepolicies, setLeavePolicies] = useState<LeavePolicy[]>([]);
    const [loading, setLoading] = useState(false);
    
    const fetchLeavePolicies = useCallback(async () => {
        setLoading(true);
        try {
            const data = await LeavePolicyService.getAllLeavePolicies();
            setLeavePolicies(data);
        } catch (err) {
            console.error("Leave Policy Load Error:", err);
        } finally {
            setLoading(false);
        }
    }, []);
    
    useEffect(() => {
        if (shouldFetch) {
            fetchLeavePolicies();
        }
    }, [shouldFetch, fetchLeavePolicies]);
    
    return { 
        leavepolicies,
        loading,
        setLeavePolicies,
        fetchLeavePolicies
    };
}