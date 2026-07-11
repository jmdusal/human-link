import { useState } from 'react';
import Sidebar from '../components/layouts/Sidebar';
import TopHeader from '../components/layouts/TopHeader';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Dashboard({ children }: LayoutProps) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    return (
        <div className="flex h-screen bg-[#F0F2F5] text-slate-700 font-sans overflow-hidden">
            <Sidebar
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
            />

            <div className="flex-1 flex flex-col overflow-hidden">
                <TopHeader
                    isSidebarCollapsed={isSidebarCollapsed}
                    onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
                />

                <main className="flex-1 overflow-y-auto p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
