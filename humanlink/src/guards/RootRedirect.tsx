import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

export default function RootRedirect() {
    const { user, loading } = useAuth();
    
    if (loading) return <LoadingSpinner />;
    
    return user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
}