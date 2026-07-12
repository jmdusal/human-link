import { Suspense, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Sidebar from '@/components/layouts/Sidebar';
import TopHeader from '@/components/layouts/TopHeader';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useAuth } from '@/context/AuthContext';

const DashboardLayout = () => {
    const { user, loading } = useAuth();
    const location = useLocation();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    if (loading) {
        return <LoadingSpinner fullPage />;
    }

    if (!user) {
        return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
    }

    return (
        <Suspense fallback={<LoadingSpinner fullPage />}>
            <div className="flex h-screen overflow-hidden bg-white transition-colors duration-200 dark:bg-slate-950">
                <Sidebar
                    isCollapsed={isSidebarCollapsed}
                    onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
                />

                <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                    <TopHeader
                        isSidebarCollapsed={isSidebarCollapsed}
                        onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
                    />

                    <main className="flex-1 overflow-y-auto p-4 md:p-8">
                        <div className="mx-auto max-w-[1600px]">
                            <Outlet />
                        </div>
                    </main>
                </div>
            </div>
        </Suspense>
    );
};

export default DashboardLayout;
