import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Settings2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import type { WorkspaceTab } from '@/constants/tabs';
import { WORKSPACE_MANAGE_TABS } from '@/constants/tabs';
import { useWorkspacePermissions } from '@/utils/workspacePermissions';

interface WorkspaceLayoutProps {
    data: any;
    activeTab: WorkspaceTab['id'];
    tabs: readonly WorkspaceTab[] | WorkspaceTab[];
    manageTabs?: readonly WorkspaceTab[] | WorkspaceTab[];
    onTabChange: (tabId: WorkspaceTab['id']) => void;
    children: React.ReactNode;
    hideHeader?: boolean;
}

export default function WorkspaceLayout({
    data,
    tabs,
    manageTabs = WORKSPACE_MANAGE_TABS,
    activeTab,
    onTabChange,
    children,
    hideHeader,
}: WorkspaceLayoutProps) {
    const navigate = useNavigate();
    const isBoard = activeTab === 'board';
    const [isManageOpen, setIsManageOpen] = useState(false);
    const manageRef = useRef<HTMLDivElement>(null);
    const { isAdminOrOwner: isWorkspaceAdminOrOwner } = useWorkspacePermissions(data);

    const activeManageTab = manageTabs.find((tab) => tab.id === activeTab);
    const isManageActive = Boolean(activeManageTab);

    useEffect(() => {
        if (!isManageOpen) return;

        const handlePointerDown = (event: MouseEvent) => {
            if (manageRef.current && !manageRef.current.contains(event.target as Node)) {
                setIsManageOpen(false);
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setIsManageOpen(false);
        };

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isManageOpen]);

    useEffect(() => {
        if (!isWorkspaceAdminOrOwner && isManageActive) {
            onTabChange('overview');
        }
    }, [isWorkspaceAdminOrOwner, isManageActive, onTabChange]);

    const handlePrimaryTabChange = (tabId: WorkspaceTab['id']) => {
        setIsManageOpen(false);
        onTabChange(tabId);
    };

    const handleManageTabChange = (tabId: WorkspaceTab['id']) => {
        setIsManageOpen(false);
        onTabChange(tabId);
    };

    return (
        <div className="fixed inset-0 z-[50] bg-slate-50 flex flex-col font-sans antialiased text-slate-900 overflow-hidden">
            {!hideHeader && (
                <header className="shrink-0 bg-white border-b border-slate-200">
                    <div className="flex items-center justify-between gap-4 px-6 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="flex flex-col min-w-0">
                                <h2 className="text-base font-semibold text-slate-900 truncate leading-tight">
                                    {data.name}
                                </h2>
                                <span className="text-xs font-medium text-slate-500 truncate">
                                    {data.slug}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {isWorkspaceAdminOrOwner && (
                                <div className="relative" ref={manageRef}>
                                    <Button
                                        variant={isManageActive ? 'primary' : 'secondary'}
                                        icon={Settings2}
                                        onClick={() => setIsManageOpen((open) => !open)}
                                        aria-expanded={isManageOpen}
                                        aria-haspopup="menu"
                                    >
                                        {activeManageTab?.label ?? 'Manage'}
                                        <ChevronDown
                                            size={16}
                                            strokeWidth={2.5}
                                            className={`transition-transform ${isManageOpen ? 'rotate-180' : ''}`}
                                        />
                                    </Button>

                                    <AnimatePresence>
                                        {isManageOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 4 }}
                                                transition={{ duration: 0.12 }}
                                                className="absolute top-full right-0 mt-2 w-56 rounded-lg bg-white border border-slate-200 shadow-lg p-1.5 z-50"
                                                role="menu"
                                            >
                                                <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                                    Workspace
                                                </p>
                                                {manageTabs.map((tab) => {
                                                    const Icon = tab.icon;
                                                    const isActive = activeTab === tab.id;
                                                    return (
                                                        <button
                                                            key={tab.id}
                                                            role="menuitem"
                                                            onClick={() => handleManageTabChange(tab.id)}
                                                            className={`
                                                                w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-left
                                                                transition-colors
                                                                ${isActive
                                                                    ? 'bg-blue-50 text-blue-700'
                                                                    : 'text-slate-700 hover:bg-slate-50'
                                                                }
                                                            `}
                                                        >
                                                            <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                                                            {tab.label}
                                                        </button>
                                                    );
                                                })}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}

                            <Button
                                variant="secondary"
                                onClick={() => navigate('/workspaces')}
                            >
                                Exit
                            </Button>
                        </div>
                    </div>

                    <nav className="flex items-center gap-1 px-6 overflow-x-auto">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.id;
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => handlePrimaryTabChange(tab.id)}
                                    className={`
                                        relative flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap
                                        border-b-2 transition-colors outline-none
                                        ${isActive
                                            ? 'border-blue-600 text-blue-700'
                                            : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                                        }
                                    `}
                                >
                                    <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </header>
            )}

            <main className="flex-1 relative flex flex-col min-h-0 overflow-hidden">
                <div className={`flex-1 w-full h-full flex flex-col min-h-0 ${isBoard ? 'overflow-hidden' : 'overflow-y-auto'}`}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className={isBoard ? 'flex-1 w-full flex flex-col min-h-0 p-4' : 'flex-1 w-full p-6'}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
