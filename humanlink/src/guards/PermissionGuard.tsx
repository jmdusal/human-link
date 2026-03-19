import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface GuardProps {
    permission: string;
    children: React.ReactNode;
}

export const PermissionGuard = ({ permission, children }: GuardProps) => {
    const { can, loading } = useAuth();
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (!loading && !can(permission)) {
            setShowModal(true);
        }
    }, [can, permission, loading]);

    if (loading) return <div>Checking permissions...</div>;

    if (showModal) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h2>
                    <p className="text-slate-500 mb-6">
                        You do not have the required permissions (`{permission}`) to view this page.
                    </p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};