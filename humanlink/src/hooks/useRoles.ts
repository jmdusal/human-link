import { useState, useEffect, useCallback, useMemo } from 'react';
import { RoleService } from '@/services/RoleService';
import type { Role } from '@/types/models';

export const useRoles = (shouldFetch: boolean) => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(false);
    
    const fetchRoles = useCallback(async () => {
        setLoading(true);
        try {
            const data = await RoleService.getAllRoles();
            setRoles(data);
        } catch (err) {
            console.error("Failed to load roles:", err);
        } finally {
            setLoading(false);
        }
    }, []);
    
    useEffect(() => {
        if (shouldFetch) {
            fetchRoles();
        }
    }, [shouldFetch, fetchRoles]);
    
    const roleOptions = useMemo(() => {
        return roles.map(role => ({
            value: role.name,
            label: role.name.charAt(0).toUpperCase() + role.name.slice(1)
        }));
    }, [roles]);
    
    return { 
        roles,
        roleOptions,
        loading,
        setRoles,
        fetchRoles
    };
};