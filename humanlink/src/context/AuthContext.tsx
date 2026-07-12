import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '@/api/axios';
import { CompanyService } from '@/services/CompanyService';

export interface Company {
    id: number;
    name: string;
    slug: string;
    legalName?: string | null;
    legal_name?: string | null;
    timezone?: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    roles: string[];
    permissions: string[];
    userType?: string | null;
    userTypeId?: number | null;
    accessScope?: 'self' | 'workspace' | 'company' | null;
    companyId?: number;
    company_id?: number;
    company?: Company | null;
}

interface AuthContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    loading: boolean;
    checkAuth: () => Promise<User | null | undefined>;
    can: (permission: string) => boolean;
    hasRole: (role: string) => boolean;
    switchCompany: (companyId: number) => Promise<Company>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/user');

            const userData = {
                ...response.data.user,
                roles: response.data.roles,
                permissions: response.data.permissions,
            };
            setUser(userData);
            return userData;
        } catch {
            setUser(null);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const can = useMemo(() => (permission: string) => {
        if (!user || !Array.isArray(user.permissions)) return false;
        return user.permissions.includes(permission);
    }, [user]);

    const hasRole = useMemo(() => (role: string) => {
        if (!user?.roles || !Array.isArray(user.roles)) return false;

        return user.roles.some((entry: unknown) => {
            if (typeof entry === 'string') return entry === role;
            if (entry && typeof entry === 'object' && 'name' in entry) {
                return (entry as { name?: string }).name === role;
            }
            return false;
        });
    }, [user]);

    const switchCompany = useCallback(async (companyId: number) => {
        const company = await CompanyService.switch(companyId);
        await checkAuth();
        return company;
    }, [checkAuth]);

    const value = useMemo(
        () => ({ user, setUser, loading, checkAuth, can, hasRole, switchCompany }),
        [user, loading, checkAuth, can, hasRole, switchCompany]
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
