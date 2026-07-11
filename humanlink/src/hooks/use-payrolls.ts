import { useState, useEffect, useCallback } from 'react';
import { PayrollService } from '@/services/PayrollService';
import type { Payslip, PayrollMeta } from '@/types';

export const usePayrolls = (shouldFetch: boolean, year: number, month: number) => {
    const [payslips, setPayslips] = useState<Payslip[]>([]);
    const [meta, setMeta] = useState<PayrollMeta | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchPayslips = useCallback(async () => {
        setLoading(true);
        try {
            const result = await PayrollService.list(year, month);
            setPayslips(result.data);
            setMeta(result.meta);
        } catch (err) {
            console.error('Payroll Load Error:', err);
        } finally {
            setLoading(false);
        }
    }, [year, month]);

    useEffect(() => {
        if (shouldFetch) {
            fetchPayslips();
        }
    }, [shouldFetch, fetchPayslips]);

    return {
        payslips,
        meta,
        loading,
        setPayslips,
        fetchPayslips,
    };
};
