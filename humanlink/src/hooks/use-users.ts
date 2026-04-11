import { useState, useEffect, useCallback, useMemo } from 'react';
import { UserService } from '@/services/UserService';
import type { User } from '@/types';

export const useUsers = (shouldFetch: boolean) => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await UserService.getAllUsers();
            setUsers(data);
        } catch (err) {
            // console.error("Failed to load users:", err);
        } finally {
            setLoading(false);
        }
    }, []);
    
    const fetchWorkspaceUsers = useCallback(async (workspaceId: number) => {
        setLoading(true);
        try {
            const data = await UserService.getUsersByWorkspace(workspaceId);
            setUsers(data);
        } catch (err) {
            // console.error("Failed to load workspace users:", err);
        } finally {
            setLoading(false);
        }
    }, []);
    
    const fetchProjectUsers = useCallback(async (projectId: number) => {
        setLoading(true);
        try {
            const data = await UserService.getUsersByProject(projectId);
            setUsers(data);
        } catch (err) {
            // console.error("Failed to load workspace users:", err);
        } finally {
            setLoading(false);
        }
    }, []);
    
    useEffect(() => {
        if (shouldFetch) {
            fetchUsers();
        }
    }, [shouldFetch, fetchUsers]);
    
    const userOptions = useMemo(() => {
        return users.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            status: user.status,
            
            value: user.id,
            label: user.name
        }));
    }, [users]);
    
    return { 
        users,
        loading,
        setUsers,
        fetchUsers,
        fetchWorkspaceUsers,
        fetchProjectUsers,
        userOptions
    };
}