import { useState } from 'react';
import { 
    X, Mail, Shield, Activity, User as UserIcon, 
    Wallet, History, Settings,
    Banknote, Clock, CalendarDays, Percent
} from 'lucide-react';

interface ModalViewProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    data: any;
}

const TABS = [
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'rates', label: 'Rates & Salary', icon: Wallet },
    { id: 'history', label: 'History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
];

export default function UserProfile({ isOpen, onClose, title, data }: ModalViewProps) {
    const [activeTab, setActiveTab] = useState('profile');

    if (!isOpen || !data) return null;
    
    const formatCurrency = (value: any) => {
        const num = parseFloat(value);
        return isNaN(num) ? '0.00' : num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-in slide-in-from-bottom duration-500 ease-out">
            
            {/* --- TOP NAVIGATION BAR --- */}
            <div className="px-8 md:px-12 py-6 flex justify-between items-center border-b border-slate-50">
                <div className="flex items-center gap-4">
                    <div className="bg-blue-50 p-3 rounded-2xl">
                        <Shield className="text-blue-600" size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 leading-none mb-1">
                            System Management
                        </p>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none">
                            {title}
                        </h2>
                    </div>
                </div>
                
                <button 
                    onClick={onClose}
                    className="p-3 hover:bg-slate-50 rounded-full transition-colors group"
                >
                    <X size={20} className="text-slate-400 group-hover:text-slate-900 transition-colors" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto px-8 py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        
                        <div className="lg:col-span-4 flex flex-col items-center lg:items-start space-y-8">
                            <div className="relative">
                                <div className={`h-48 w-48 ${data.color || 'bg-slate-500'} rounded-[3.5rem] flex items-center justify-center text-white text-7xl font-black shadow-2xl shadow-slate-200`}>
                                    {data.name.charAt(0)}
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-white p-3 rounded-2xl shadow-xl border border-slate-50">
                                    <div className={`h-5 w-5 rounded-full ${data.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
                                </div>
                            </div>

                            <div className="text-center lg:text-left">
                                <h3 className="text-5xl font-black text-slate-800 tracking-tighter mb-4 leading-[0.9]">
                                    {data.name}
                                </h3>
                                <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                                    <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                                        {data.role || 'Operator'}
                                    </span>
                                    <span className="px-4 py-1.5 bg-slate-50 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-100">
                                        ID: #{data.id || '000'}
                                    </span>
                                </div>
                            </div>

                            {/* TAB NAVIGATION */}
                            <nav className="w-full space-y-2 mt-8">
                                {TABS.map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-200 font-bold text-sm ${
                                                isActive 
                                                    ? "bg-blue-600 text-white shadow-lg shadow-slate-200 translate-x-2" 
                                                    : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                                            }`}
                                        >
                                            <Icon size={18} />
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>

                        {/* RIGHT COLUMN: DYNAMIC CONTENT PANEL */}
                        <div className="lg:col-span-8">
                            <div className="bg-slate-50/30 border border-slate-100 rounded-[3rem] p-8 md:p-12 min-h-[550px]">
                                
                                {/* PROFILE TAB */}
                                {activeTab === 'profile' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                        <div className="md:col-span-2 p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
                                            <div className="flex items-center gap-4 text-slate-400 mb-4 text-[10px] font-black uppercase tracking-widest">
                                                <Mail size={18} /> Official Email Address
                                            </div>
                                            <p className="text-2xl font-bold text-slate-700">{data.email}</p>
                                        </div>
                                        <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
                                            <div className="flex items-center gap-4 text-slate-400 mb-4 text-[10px] font-black uppercase tracking-widest">
                                                <Activity size={18} /> Activity Status
                                            </div>
                                            <p className={`text-xl font-bold ${data.status === 'active' ? 'text-green-600' : 'text-slate-600'}`}>
                                                {data.status === 'active' ? 'Verified Active' : 'Inactive'}
                                            </p>
                                        </div>
                                        <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
                                            <div className="flex items-center gap-4 text-slate-400 mb-4 text-[10px] font-black uppercase tracking-widest">
                                                <Shield size={18} /> Access Rights
                                            </div>
                                            <p className="text-xl font-bold text-slate-700">Level {data.role === 'Admin' ? '1' : '2'}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Rates & Salary TAB */}
                                {activeTab === 'rates' && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                        {/* Main Monthly Rate Card */}
                                        <div className="bg-blue-600 p-10 rounded-[3rem] text-white shadow-2xl shadow-blue-100 relative overflow-hidden">
                                            <div className="relative z-10">
                                                <div className="flex justify-between items-start mb-8">
                                                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                                                        <Banknote size={24} />
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Effective Date</span>
                                                        <p className="text-sm font-bold">{data.rate?.effectiveDate || 'Not Set'}</p>
                                                    </div>
                                                </div>
                                                <p className="text-sm font-medium opacity-80 mb-1">Monthly Base Salary</p>
                                                <p className="text-6xl font-black tracking-tighter">
                                                    ₱{formatCurrency(data.rate?.monthlyRate)}
                                                </p>
                                            </div>
                                            {/* Decorative Background Shape */}
                                            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                                        </div>

                                        {/* Breakdown Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                                                <div className="flex items-center gap-3 text-slate-400 mb-3">
                                                    <CalendarDays size={16} />
                                                    <span className="text-[9px] font-black uppercase tracking-widest">Daily Rate</span>
                                                </div>
                                                <p className="text-xl font-black text-slate-700">₱{formatCurrency(data.rate?.dailyRate)}</p>
                                            </div>

                                            <div className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                                                <div className="flex items-center gap-3 text-slate-400 mb-3">
                                                    <Clock size={16} />
                                                    <span className="text-[9px] font-black uppercase tracking-widest">Hourly Rate</span>
                                                </div>
                                                <p className="text-xl font-black text-slate-700">₱{formatCurrency(data.rate?.hourlyRate)}</p>
                                            </div>

                                            <div className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                                                <div className="flex items-center gap-3 text-slate-400 mb-3">
                                                    <Percent size={16} />
                                                    <span className="text-[9px] font-black uppercase tracking-widest">Allowance</span>
                                                </div>
                                                <p className="text-xl font-black text-blue-600">₱{formatCurrency(data.rate?.allowanceMonthly)}</p>
                                            </div>
                                        </div>

                                        {/* Status Footer */}
                                        <div className="flex items-center gap-3 px-6 py-4 bg-slate-100/50 rounded-2xl border border-dashed border-slate-200">
                                            <div className={`h-2 w-2 rounded-full ${data.rate?.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                                Rates are currently {data.rate?.isActive ? 'Active' : 'Inactive'} in the payroll system
                                            </p>
                                        </div>
                                    </div>
                                )}
                                

                                {/* HISTORY TAB */}
                                {activeTab === 'history' && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Recent Activity Log</h4>
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="flex items-center justify-between p-6 bg-white rounded-3xl border border-slate-50">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400"><History size={18}/></div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-700">System Login</p>
                                                        <p className="text-[10px] text-slate-400">March 1{i}, 2024 • 10:45 AM</p>
                                                    </div>
                                                </div>
                                                <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full">SUCCESS</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* SETTINGS TAB */}
                                {activeTab === 'settings' && (
                                    <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8">
                                        <div>
                                            <h4 className="text-2xl font-black text-slate-800 tracking-tight">Account Preferences</h4>
                                            <p className="text-sm text-slate-400">Manage security and notification settings for this user.</p>
                                        </div>
                                        <div className="space-y-4">
                                            <button className="w-full flex items-center justify-between p-6 bg-white border border-slate-100 rounded-[2rem] hover:border-blue-200 transition-all text-left">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2 bg-slate-50 rounded-xl text-slate-400"><Shield size={20}/></div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-700">Two-Factor Authentication</p>
                                                        <p className="text-[10px] text-slate-400">Currently disabled for this account</p>
                                                    </div>
                                                </div>
                                                <div className="w-10 h-6 bg-slate-200 rounded-full relative"><div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full" /></div>
                                            </button>
                                            <button className="w-full p-6 bg-red-50 text-red-600 rounded-[2rem] font-bold text-sm hover:bg-red-100 transition-colors text-center border border-red-100">
                                                Reset Account Password
                                            </button>
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}