import React, { useState } from 'react';
import { X, Shield } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Tab {
    id: string;
    label: string;
    icon: LucideIcon;
}

interface ModalViewProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    data: any;
    tabs: Tab[];
    renderContent: (activeTab: string) => React.ReactNode;
    
}

export default function ModalView({ isOpen, onClose, title, data, tabs, renderContent }: ModalViewProps) {
    const [activeTab, setActiveTab] = useState(tabs[0]?.id);

    if (!isOpen || !data) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-in fade-in duration-300">
            <div className="px-6 py-4 flex justify-between items-center border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                        <Shield className="text-white" size={16} />
                    </div>
                    <span className="text-sm font-semibold text-slate-900">{title}</span>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-md text-slate-400 transition-colors group">
                    <X size={18} className="group-hover:rotate-90 transition-transform" />
                </button>
            </div>

            <div className="bg-slate-50/50 border-b border-slate-100">
                <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center gap-6">
                    <div className="relative">
                        <div className="h-20 w-20 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-inner">
                            {data.userName.charAt(0)}
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full border border-slate-100">
                            <div className="h-3 w-3 bg-emerald-500 rounded-full" />
                        </div>
                    </div>
                    
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{data.userName}</h2>
                        <div className="flex items-center justify-center md:justify-start gap-3 mt-1 text-sm text-slate-500 font-medium">
                            <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[11px] uppercase tracking-wider text-slate-600">
                                Leave Management
                            </span>
                            <span>ID: #{data.userId}</span>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Remaining</p>
                            <p className="text-2xl font-black text-emerald-600">{data.totalRemaining.toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-6">
                    <nav className="flex gap-8">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.id;
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`pb-4 text-sm font-medium transition-all relative flex items-center gap-2 ${
                                        isActive ? "text-indigo-600" : "text-slate-500 hover:text-slate-700"
                                    }`}
                                >
                                    <Icon size={16} />
                                    {tab.label}
                                    {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />}
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-white">
                <div className="max-w-6xl mx-auto px-6 py-10">
                    {renderContent(activeTab)}
                </div>
            </div>
        </div>
    );
}