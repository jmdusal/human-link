import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, loading } = useAuth();

    // if (loading) return null;
    if (loading) {
        return <LoadingSpinner />; 
    }
  
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};