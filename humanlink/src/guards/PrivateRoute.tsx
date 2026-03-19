import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface PrivateRouteProps {
    children: React.ReactNode;
    permission?: string;
}

export default function PrivateRoute({ children, permission }: PrivateRouteProps) {
    const { user, loading, can } = useAuth();
    const navigate = useNavigate();

    if (loading) return <LoadingSpinner />;
    
    if (!user) return <Navigate to="/login" replace />;

    if (permission && !can(permission)) {
        return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                <div className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-sm w-full text-center border border-white/50">
                    <div className="w-20 h-20 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <Lock size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Restricted Access</h2>
                    <p className="text-slate-500 mb-8 leading-relaxed px-4">
                        Your account doesn't have the <b className="text-red-500">{permission}</b> permission required to view this section.
                    </p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-[80%] py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-200 active:scale-95 mb-4"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};