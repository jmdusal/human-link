import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
    Users, ShieldCheck, Key, FileText, ArrowUpRight, 
    TrendingUp, ArrowDownRight, Plus, History, 
    Zap, Activity, ExternalLink, Settings 
} from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';
import { useUsers } from '@/hooks/use-users';
import { useRoles } from '@/hooks/use-roles';
import { useLeavePolicies } from '@/hooks/use-leave-policies';

interface StatProps {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    trend: string;
    isUp: boolean;
}

export default function Overview() {
    const { users, loading: uLoading } = useUsers(true);
    const { permissions, loading: pLoading } = usePermissions(true);
    const { roles, loading: rLoading } = useRoles(true);
    const { leavepolicies, loading: lLoading } = useLeavePolicies(true);

    const isAppLoading = uLoading || pLoading || rLoading || lLoading;

    const statsHistory = [
        { day: 'Mon', requests: 4 },
        { day: 'Tue', requests: 7 },
        { day: 'Wed', requests: 5 },
        { day: 'Thu', requests: 12 },
        { day: 'Fri', requests: 8 },
        { day: 'Sat', requests: 2 },
        { day: 'Sun', requests: 3 },
    ];

    // Elite Feature: Role distribution calculation
    const roleDistribution = roles?.map(role => ({
        name: role.name,
        count: users?.filter((u: any) => u.role === role.name).length || 0
    })).slice(0, 3) || [];

    if (isAppLoading) return <OverviewSkeleton />;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* --- Header Section --- */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Management Overview</h1>
                    <p className="text-slate-500 text-sm font-medium">Monitoring Users, Roles, and System Access.</p>
                </div>
                <div className="hidden md:flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[11px] font-bold uppercase tracking-wider hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200">
                        <Zap size={14} className="text-yellow-400 fill-yellow-400" />
                        Generate Report
                    </button>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">System Operational</span>
                    </div>
                </div>
            </div>
        
            {/* --- KPI Cards Section --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <OverviewStat label="Active Users" value={users.length} icon={<Users size={20}/>} trend="+12% growth" isUp={true} />
                <OverviewStat label="Roles" value={roles.length} icon={<ShieldCheck size={20}/>} trend="Stable" isUp={true} />
                <OverviewStat label="Permissions" value={permissions.length} icon={<Key size={20}/>} trend="Managed" isUp={true} />
                <OverviewStat label="Leave Policies" value={leavepolicies.length} icon={<FileText size={20}/>} trend="Active" isUp={true} />
            </div>

            {/* --- Main Content Grid --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Column (70%) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Weekly Chart */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                             <Activity size={80} />
                        </div>
                        <div className="flex justify-between items-start mb-8 relative z-10">
                            <div>
                                <h3 className="font-bold text-xl text-slate-800">Weekly Leave Activity</h3>
                                <p className="text-slate-400 text-xs font-medium mt-1">Volume of leave requests processed this week</p>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                                <TrendingUp size={20} />
                            </div>
                        </div>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={statsHistory}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94a3b8', fontWeight: 700}} dy={10} />
                                    <YAxis hide />
                                    <Tooltip
                                        cursor={{ stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '5 5' }}
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                                    />
                                    <Area type="monotone" dataKey="requests" stroke="#3b82f6" fill="url(#colorValue)" strokeWidth={4} animationDuration={1500} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Role Distribution Widget */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                <Activity size={18} className="text-blue-500" />
                                Role Distribution
                            </h3>
                            <button className="text-slate-400 hover:text-blue-500 transition-colors">
                                <ExternalLink size={16} />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {roleDistribution.length > 0 ? roleDistribution.map((item, i) => (
                                <div key={i} className="p-5 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:border-blue-100 transition-all group">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-blue-500">{item.name}</p>
                                    <div className="flex justify-between items-end">
                                        <p className="text-2xl font-black text-slate-800">{item.count}</p>
                                        <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden mb-2">
                                            <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${(item.count / (users.length || 1)) * 100}%` }} />
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="col-span-3 text-center py-4 text-slate-400 text-xs font-medium">No roles defined</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column (30%) */}
                <div className="space-y-6">
                    {/* Global Shortcuts */}
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                        <h3 className="font-bold text-slate-800 mb-4 text-sm flex items-center gap-2">
                            <Plus size={16} className="text-blue-500" />
                            Global Shortcuts
                        </h3>
                        <div className="space-y-2">
                            <ActionButton icon={<Users size={18}/>} label="Onboard User" primary />
                            <ActionButton icon={<Key size={18}/>} label="Set Permissions" />
                            <ActionButton icon={<Settings size={18}/>} label="System Config" />
                        </div>
                    </div>

                    {/* System Activity Logs */}
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex-1">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                <History size={16} className="text-blue-500" />
                                System Activity
                            </h3>
                            <span className="text-[9px] font-black text-blue-500 px-2 py-0.5 bg-blue-50 rounded-full uppercase tracking-tighter">Realtime</span>
                        </div>
                        <div className="space-y-6">
                            <ActivityItem user="AD" name="Admin" action="Updated Roles" time="2m ago" />
                            <ActivityItem user="SYS" name="System" action="Policy Created" time="1h ago" />
                            <ActivityItem user="ST" name="Staff" action="New Login" time="3h ago" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/** --- Sub-Components --- **/
const OverviewStat = ({ label, value, icon, trend, isUp }: StatProps) => (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-12 -mt-12 group-hover:bg-blue-50 transition-colors duration-500" />
        <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
                <div className="p-4 bg-slate-50 text-slate-500 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-sm">
                    {icon}
                </div>
                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black tracking-tight ${
                    isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                }`}>
                    {isUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                    {trend}
                </div>
            </div>
            <div>
                <p className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.15em] mb-1">{label}</p>
                <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
            </div>
        </div>
    </div>
);

const ActionButton = ({ icon, label, primary }: { icon: React.ReactNode, label: string, primary?: boolean }) => (
    <button className={`w-full flex items-center justify-between p-3.5 rounded-xl transition-all group ${
        primary 
        ? "bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700" 
        : "bg-slate-50 border border-slate-100 text-slate-600 hover:bg-white hover:border-blue-200 hover:text-blue-600"
    }`}>
        <div className="flex items-center gap-3">
            <div className={`${primary ? "text-blue-200" : "text-slate-400 group-hover:text-blue-500"}`}>
                {icon}
            </div>
            <span className="text-[11px] font-bold uppercase tracking-widest">{label}</span>
        </div>
        <ArrowUpRight size={14} className={`opacity-0 group-hover:opacity-100 transition-all ${primary ? "text-white" : "text-blue-500"}`} />
    </button>
);

const ActivityItem = ({ user, name, action, time }: any) => (
    <div className="flex gap-4 relative group">
        <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 shrink-0 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-300">
            {user}
        </div>
        <div className="flex flex-col min-w-0 justify-center">
            <div className="flex items-center gap-2">
                <span className="text-[13px] font-bold text-slate-800 truncate">{name}</span>
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">{time}</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium tracking-tight leading-none mt-1">{action}</p>
        </div>
    </div>
);

// Placeholder for the skeleton component
const OverviewSkeleton = () => <div className="p-8 text-slate-400 animate-pulse font-black uppercase tracking-widest">Initialising System...</div>;
