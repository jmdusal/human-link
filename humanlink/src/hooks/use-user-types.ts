import { useCallback, useEffect, useMemo, useState } from 'react';
import { UserTypeService } from '@/services/UserTypeService';
import type { UserTypeRecord } from '@/types/UserTypeRecord';

export const useUserTypes = (shouldFetch: boolean) => {
    const [userTypes, setUserTypes] = useState<UserTypeRecord[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchUserTypes = useCallback(async () => {
        setLoading(true);
        try {
            const data = await UserTypeService.getAllUserTypes();
            setUserTypes(data);
        } catch (err) {
            console.error('Failed to load user types:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (shouldFetch) {
            fetchUserTypes();
        }
    }, [shouldFetch, fetchUserTypes]);

    const userTypeOptions = useMemo(() => {
        return userTypes.map((type) => ({
            value: String(type.id),
            label: type.name,
        }));
    }, [userTypes]);

    return {
        userTypes,
        userTypeOptions,
        loading,
        setUserTypes,
        fetchUserTypes,
    };
};
