import { useState, useEffect, useCallback } from 'react';
import { PositionService } from '@/services/PositionService';
import type { Position } from '@/types';

export const usePositions = (shouldFetch: boolean, departmentId?: string | number) => {
    const [positions, setPositions] = useState<Position[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchPositions = useCallback(async () => {
        setLoading(true);
        try {
            const data = await PositionService.getAllPositions(
                departmentId ? { departmentId } : undefined
            );
            setPositions(data);
        } catch (err) {
            console.error('Position Load Error:', err);
        } finally {
            setLoading(false);
        }
    }, [departmentId]);

    useEffect(() => {
        if (shouldFetch) {
            fetchPositions();
        }
    }, [shouldFetch, fetchPositions]);

    return {
        positions,
        loading,
        setPositions,
        fetchPositions,
    };
};
