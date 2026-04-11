import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/layouts/Sidebar';
import TopHeader from '@/components/layouts/TopHeader';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

const DashboardLayout = () => {
    return (
        <div className="flex h-screen bg-[#F0F2F5] overflow-hidden">
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <TopHeader />
                
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-[1600px] mx-auto">
                        <Suspense fallback={<LoadingSpinner />}>
                            <Outlet />
                        </Suspense>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;