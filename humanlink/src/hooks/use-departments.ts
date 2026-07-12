import { useState, useEffect, useCallback } from 'react';
import { DepartmentService } from '@/services/DepartmentService';
import type { Department } from '@/types';

export const useDepartments = (shouldFetch: boolean) => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchDepartments = useCallback(async () => {
        setLoading(true);
        try {
            const data = await DepartmentService.getAllDepartments();
            setDepartments(data);
        } catch (err) {
            console.error('Department Load Error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (shouldFetch) {
            fetchDepartments();
        }
    }, [shouldFetch, fetchDepartments]);

    return {
        departments,
        loading,
        setDepartments,
        fetchDepartments,
    };
};
