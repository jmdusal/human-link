import { useState } from 'react';
import { X, Shield, PieChart, History as LucideHistory, } from 'lucide-react';
import ModalTabs from '@/components/ui/ModalTabs';
import type { LeaveBalance, GroupedLeaveBalance } from '@/types';
import { getInitials } from '@/utils/userUtils';

interface ModalViewProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    data: GroupedLeaveBalance | null;
    // onEditPolicy: (policy: LeaveBalance) => void;
}

const LEAVE_TABS = [
    { id: 'breakdown', label: 'Credits Breakdown', icon: PieChart },
    { id: 'history', label: 'Usage History', icon: LucideHistory },
];

export default function LeaveBalancesOverviewModal({ isOpen, onClose, title, data }: ModalViewProps) {
    const [activeTab, setActiveTab] = useState(LEAVE_TABS[0]?.id);

    if (!isOpen || !data) return null;
    
    const handleEdit = (policy: LeaveBalance) => {
        console.log('🔵 Policy Data Clicked:', policy);
        // onEditPolicy(policy);
    };

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
                {/* CHANGED: max-w-7xl for a wider look */}
                <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center gap-6">
                    <div className="relative">
                        
                        <div className="h-20 w-20 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-inner">
                            {/* {data.userName.charAt(0)} */}
                            {getInitials(data.userName)}
                        </div>
                        {/* <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full border border-slate-100">
                            <div className="h-3 w-3 bg-emerald-500 rounded-full" />
                        </div> */}
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
                            <p className="text-2xl font-black text-black-600">
                                {Number(data.totalRemaining)}
                            </p>
                        </div>
                    </div>
                </div>
                {/* max-w-7xl */}
                
                <ModalTabs
                    tabs={LEAVE_TABS}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />
                
                {/* <div className="max-w-7xl mx-auto px-6">
                    <nav className="flex gap-8">
                        {LEAVE_TABS.map((tab) => {
                            const isActive = activeTab === tab.id;
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`pb-4 text-sm font-medium transition-all relative flex items-center gap-2 ${
                                        isActive ? "text-blue-600" : "text-slate-500 hover:text-slate-700"
                                    }`}
                                >
                                    <Icon size={16} />
                                    {tab.label}
                                    {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
                                </button>
                            );
                        })}
                    </nav>
                </div> */}
            </div>

            <div className="flex-1 overflow-y-auto bg-white">
                {/* max-w-7xl */}
                <div className="max-w-7xl mx-auto px-6 py-10">
                    
                    <div className="w-full">
                        {activeTab === 'breakdown' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                {data.policies.map((data) => (
                                    <div
                                        key={data.id}
                                        onClick={() => handleEdit(data)}
                                        className="p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5 cursor-pointer hover:bg-slate-50/80 active:opacity-80 transition-all select-none group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">
                                                    {data.leavePolicy?.name}
                                                </p>
                                                <p className="text-xl font-bold text-slate-700">
                                                    {Number(data.remaining)} <span className="text-xs font-medium text-slate-400">Days</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {activeTab === 'history' && (
                            <div className="bg-slate-50/50 rounded-[2rem] p-12 text-center border border-dashed border-slate-200 animate-in fade-in zoom-in-95 duration-300">
                                <LucideHistory size={48} className="mx-auto text-slate-200 mb-4" />
                                <p className="text-slate-400 font-bold italic text-sm">
                                    No leave usage history recorded for this year.
                                </p>
                            </div>
                        )}
                        
                    </div>
                </div>
            </div>
        </div>
    );
}
