import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import api from '@/api/axios';

export interface User {
    id: number;
    name: string;
    email: string;
    roles: string[];
    permissions: string[];
}

interface AuthContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    loading: boolean;
    checkAuth: () => Promise<void>;
    can: (permission: string) => boolean;
    hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        setLoading(true);
        try {
            const response = await api.get('/user');

            const userData = {
                ...response.data.user,
                roles: response.data.roles,
                permissions: response.data.permissions
            };
            setUser(userData);
            console.log("Logged in user:", userData);
            return userData;
        } catch (err) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const can = useMemo(() => (permission: string) => {
        // return user?.permissions?.includes(permission) ?? false;
        if (!user || !Array.isArray(user.permissions)) return false;
        return user.permissions.includes(permission);
    }, [user]);

    const hasRole = useMemo(() => (role: string) => {
        return user?.roles?.includes(role) ?? false;
    }, [user]);

    return (
        <AuthContext.Provider value={{ user, setUser, loading, checkAuth, can, hasRole }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};