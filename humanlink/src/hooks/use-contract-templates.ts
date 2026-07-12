import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ContractTemplateService } from '@/services/ContractTemplateService';
import type { ContractTemplate } from '@/types';

export const useContractTemplates = (shouldFetch: boolean) => {
    const { user } = useAuth();
    const companyId = Number(user?.companyId ?? user?.company_id ?? 0) || null;
    const [templates, setTemplates] = useState<ContractTemplate[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchTemplates = useCallback(async () => {
        setLoading(true);
        try {
            const data = await ContractTemplateService.getAll();
            setTemplates(data);
        } catch (err) {
            console.error('Contract Template Load Error:', err);
            setTemplates([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!shouldFetch) return;
        fetchTemplates();
    }, [shouldFetch, companyId, fetchTemplates]);

    return {
        templates,
        loading,
        setTemplates,
        fetchTemplates,
    };
};
