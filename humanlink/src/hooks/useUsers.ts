import { useState, useEffect, useCallback } from 'react';
import { UserService } from '@/services/UserService';
import type { User } from '@/types/models';

export const useUsers = (shouldFetch: boolean) => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await UserService.getAllUsers();
            setUsers(data);
        } catch (err) {
            console.error("Failed to load users:", err);
        } finally {
            setLoading(false);
        }
    }, []);
    
    useEffect(() => {
        if (shouldFetch) {
            fetchUsers();
        }
    }, [shouldFetch, fetchUsers]);
    
    return { 
        users,
        loading,
        setUsers,
        fetchUsers
    };
}