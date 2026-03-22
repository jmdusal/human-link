import { useState, useEffect, useCallback } from 'react';
import { PermissionService } from '@/services/PermissionService';
import type { Permission } from '@/types/models';

export const usePermissions = (shouldFetch: boolean) => {
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchPermissions = useCallback(async () => {
        setLoading(true);
        try {
            const data = await PermissionService.getAllPermissions();
            setPermissions(data);
        } catch (err) {
            console.error("Permission Load Error:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (shouldFetch) {
            fetchPermissions();
        }
    }, [shouldFetch, fetchPermissions]);

    return { 
        permissions,
        loading,
        setPermissions,
        fetchPermissions
    };
}