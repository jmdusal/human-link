import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { IdCardTemplateService } from '@/services/IdCardTemplateService';
import type { IdCardTemplate } from '@/types';

export const useIdCardTemplates = (shouldFetch: boolean) => {
    const { user } = useAuth();
    const companyId = Number(user?.companyId ?? user?.company_id ?? 0) || null;
    const [templates, setTemplates] = useState<IdCardTemplate[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchTemplates = useCallback(async () => {
        setLoading(true);
        try {
            const data = await IdCardTemplateService.getAll();
            setTemplates(data);
        } catch (err) {
            console.error('ID Card Template Load Error:', err);
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
