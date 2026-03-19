import { useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { navItems } from '@/routes/routes';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export const TitleUpdater = () => {
    const location = useLocation();
    
    useEffect(() => {
        const currentRoute = navItems.find(item => item.path === location.pathname);
        document.title = currentRoute?.title || 'Admin Portal';
    }, [location]);

    return null;
};

export const RootRedirect = () => {
    const { user, loading } = useAuth();
    if (loading) return <LoadingSpinner />;
    return user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
};