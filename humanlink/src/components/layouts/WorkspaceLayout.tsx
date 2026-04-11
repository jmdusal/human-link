import React from 'react';
import { ArrowLeft, ChevronRight, Globe, Search, Bell, Settings as SettingsIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { WorkspaceTab } from '@/constants/tabs';

interface WorkspaceLayoutProps {
    data: any;
    activeTab: WorkspaceTab['id'];
    tabs: readonly WorkspaceTab[] | WorkspaceTab[];
    onTabChange: (tabId: WorkspaceTab['id']) => void;
    children: React.ReactNode;
    hideHeader?: boolean; 
}

export default function WorkspaceLayout({ data, tabs, activeTab, onTabChange, children, hideHeader }: WorkspaceLayoutProps) {
    const navigate = useNavigate();
    const isBoard = activeTab === 'board';

    return (
        <div className="fixed inset-0 z-[50] bg-[#F6F8FC] flex flex-col font-sans antialiased text-slate-900 overflow-hidden">

            <AnimatePresence>
                {!hideHeader && (
                    <motion.header 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="relative z-[10] flex items-center justify-between px-6 py-3 shrink-0"
                    >
                        {/* Branding Area - Minimal & Clean */}
                        <div className="flex items-center gap-4 min-w-0">
                            <div 
                                onClick={() => navigate('/workspaces')} 
                                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-200/50 cursor-pointer transition-colors"
                            >
                                <Globe size={22} className="text-blue-600" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <h2 className="text-[16px] font-medium text-[#1f1f1f] truncate leading-tight">
                                    {data.name}
                                </h2>
                                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-tight opacity-70">
                                    {data.slug}
                                </span>
                            </div>
                        </div>

                        <nav className="flex items-center gap-1 bg-[#EAF1FB] p-1.5 rounded-full px-2">
                            {tabs.map((tab) => {
                                const isActive = activeTab === tab.id;
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => onTabChange(tab.id)}
                                        className={`
                                            relative px-5 py-2 rounded-full text-[13px] font-semibold
                                            transition-all duration-200 flex items-center gap-2.5 outline-none
                                            ${isActive 
                                                ? "text-[#001d35]" 
                                                : "text-[#444746] hover:bg-[#d3e3fd]/60"
                                            }
                                        `}
                                    >
                                        <Icon 
                                            size={18} 
                                            strokeWidth={isActive ? 2.5 : 2} 
                                            className="relative z-20"
                                        />
                                        <span className="relative z-20">{tab.label}</span>
                                        
                                        {/* Active Indicator - Fixed Visibility */}
                                        {isActive && (
                                            <motion.div 
                                                layoutId="gmailActive" 
                                                className="absolute inset-0 bg-[#C2E7FF] rounded-full z-10 shadow-[0_1px_2px_rgba(0,0,0,0.05)]" 
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}

                                        {/* Hover Effect Overlay */}
                                        <div className={`
                                            absolute inset-0 rounded-full transition-colors duration-200 z-0
                                            ${isActive ? "hover:bg-black/5" : "hover:bg-transparent"}
                                        `} />
                                    </button>
                                );
                            })}
                        </nav>

                        {/* <nav className="flex items-center gap-1 bg-[#EAF1FB] p-1.5 rounded-full px-2">
                            {tabs.map((tab) => {
                                const isActive = activeTab === tab.id;
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => onTabChange(tab.id)}
                                        className={`relative px-5 py-2 rounded-full text-[13px] font-medium transition-all duration-200 flex items-center gap-2.5 ${
                                            isActive 
                                            ? "text-[#001d35]" 
                                            : "text-[#444746] hover:bg-[#d3e3fd]"
                                        }`}
                                    >
                                        <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                                        {tab.label}
                                        {isActive && (
                                            <motion.div 
                                                layoutId="gmailActive" 
                                                className="absolute inset-0 bg-[#C2E7FF] rounded-full -z-10" 
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                    </button>
                                    
                                );
                            })}
                        </nav> */}

                        {/* Right Side Actions */}
                        <div className="flex items-center gap-2">
                             <button className="p-2 hover:bg-slate-200/50 rounded-full text-slate-600 transition-colors">
                                <Search size={20} />
                            </button>
                            <button 
                                onClick={() => navigate('/workspaces')} 
                                className="flex items-center gap-2 ml-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-[13px] font-medium text-slate-600 hover:shadow-sm transition-all"
                            >
                                <ArrowLeft size={16} />
                                Exit
                            </button>
                        </div>
                    </motion.header>
                )}
            </AnimatePresence>

            <main className={`flex-1 relative flex flex-col min-h-0 mx-4 mb-4 bg-white rounded-[24px] shadow-sm overflow-hidden ${hideHeader ? 'mt-4' : ''}`}>
                <div className={`relative z-[20] flex-1 w-full h-full flex flex-col min-h-0 ${isBoard ? 'overflow-hidden' : 'overflow-y-auto'}`}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className={isBoard ? "flex-1 w-full flex flex-col min-h-0 p-8" : "flex-1 w-full p-8"}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
