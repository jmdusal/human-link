import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import TopHeader from '@/components/TopHeader';
import { LoadingSpinner } from '@/components/LoadingSpinner';

const DashboardLayout = () => {
    return (
        <div className="flex h-screen bg-[#F0F2F5] overflow-hidden">
            {/* Sidebar stays mounted during navigation */}
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <TopHeader />
                
                {/* Dynamic Content Area */}
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