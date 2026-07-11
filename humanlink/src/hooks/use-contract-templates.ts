import { useState, useEffect, useCallback } from 'react';
import { ContractTemplateService } from '@/services/ContractTemplateService';
import type { ContractTemplate } from '@/types';

export const useContractTemplates = (shouldFetch: boolean) => {
    const [templates, setTemplates] = useState<ContractTemplate[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchTemplates = useCallback(async () => {
        setLoading(true);
        try {
            const data = await ContractTemplateService.getAll();
            setTemplates(data);
        } catch (err) {
            console.error('Contract Template Load Error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (shouldFetch) {
            fetchTemplates();
        }
    }, [shouldFetch, fetchTemplates]);

    return {
        templates,
        loading,
        setTemplates,
        fetchTemplates,
    };
};
