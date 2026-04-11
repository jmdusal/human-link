import { useState, useEffect } from 'react';
import { LeaveService } from '@/services/LeaveService';

export function useLeave() {
    const [data, setData] = useState({ policies: [], balances: [], requests: [] });
    const [loading, setLoading] = useState(true);

    const fetchOverview = async () => {
        setLoading(true);
        try {
            const res = await LeaveService.getAllLeaveOverview();
            setData(res);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOverview(); }, []);

    return { data, loading, refresh: fetchOverview };
}