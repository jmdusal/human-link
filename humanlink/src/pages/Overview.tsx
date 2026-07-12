import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
    Users, FileText, ArrowUpRight, ArrowDownRight, Plus, History,
    Zap, Activity, ExternalLink, FolderKanban, Globe, Clock3,
    Wallet, CalendarDays, AlertCircle,
} from 'lucide-react';
import { useWorkspaces } from '@/hooks/use-workspace';
import { useAuth } from '@/context/AuthContext';
import { getInitials } from '@/utils/userUtils';
import { DashboardService } from '@/services/DashboardService';
import { MeService } from '@/services/MeService';
import { formatCurrency } from '@/utils/formatUtils';
import MyContractCard from '@/components/shared/MyContractCard';
import MyIdCardCard from '@/components/shared/MyIdCardCard';
import type { DashboardSummary, Workspace } from '@/types';

interface StatProps {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    trend: string;
    isUp: boolean;
    onClick?: () => void;
}

export default function Overview() {
    const navigate = useNavigate();
    const { can, user, hasRole, loading: authLoading } = useAuth();
    const isAdminView = can('users-view') || hasRole('super-admin') || user?.accessScope === 'company';
    const canViewWorkspaces = can('workspaces-view');

    const { workspaces, loading: wLoading } = useWorkspaces(!authLoading && canViewWorkspaces);
    const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
    const [dashLoading, setDashLoading] = useState(true);
    const [generatingContract, setGeneratingContract] = useState(false);
    const [generatingIdCard, setGeneratingIdCard] = useState(false);

    useEffect(() => {
        if (authLoading) return;

        let cancelled = false;
        setDashLoading(true);

        DashboardService.summary()
            .then((data) => {
                if (!cancelled) setDashboard(data);
            })
            .catch(() => {
                if (!cancelled) setDashboard(null);
            })
            .finally(() => {
                if (!cancelled) setDashLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [authLoading]);

    const handleGenerateContract = async () => {
        setGeneratingContract(true);
        try {
            const document = await MeService.generateContract();
            setDashboard((prev) => (prev ? { ...prev, contract: document } : prev));
            toast.success('Contract generated.');
        } catch (error: any) {
            toast.error(
                error?.response?.data?.message
                || error?.response?.data?.errors?.contract?.[0]
                || error?.response?.data?.errors?.employmentType?.[0]
                || error?.response?.data?.errors?.templateId?.[0]
                || 'Failed to generate contract.'
            );
        } finally {
            setGeneratingContract(false);
        }
    };

    const handleGenerateIdCard = async () => {
        setGeneratingIdCard(true);
        try {
            const document = await MeService.generateIdCard();
            setDashboard((prev) => (prev ? { ...prev, idCard: document } : prev));
            toast.success('ID card generated.');
        } catch (error: any) {
            toast.error(
                error?.response?.data?.message
                || error?.response?.data?.errors?.idScan?.[0]
                || error?.response?.data?.errors?.templateId?.[0]
                || 'Failed to generate ID card.'
            );
        } finally {
            setGeneratingIdCard(false);
        }
    };

    const isAppLoading = authLoading || wLoading || dashLoading;
    const kpis = dashboard?.kpis;
    const leaveActivity = dashboard?.leaveActivity ?? [];
    const roleDistribution = dashboard?.roleDistribution ?? [];
    const recentActivity = dashboard?.recentActivity ?? [];
    const totalRoleUsers = roleDistribution.reduce((sum, item) => sum + item.count, 0) || 1;

    const myRoleInWorkspace = (ws: Workspace) =>
        ws.members?.find((m: any) => m.id === user?.id)?.pivot?.role || 'member';

    const handleOpenWorkspace = (workspace: Workspace) => {
        navigate(`/workspaces/${workspace.slug}`, { state: { workspace } });
    };

    if (isAppLoading) return <OverviewSkeleton />;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                        {isAdminView ? 'Management Overview' : 'My Dashboard'}
                    </h1>
                    <p className="text-slate-500 text-sm font-medium">
                        {isAdminView
                            ? 'Live attendance, leave, and payroll metrics.'
                            : `Welcome back, ${user?.name?.split(' ')[0] || 'there'}.`}
                    </p>
                </div>
                {isAdminView && (
                    <div className="hidden md:flex gap-3">
                        <button
                            type="button"
                            onClick={() => navigate('/reports')}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[11px] font-bold uppercase tracking-wider hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
                        >
                            Generate Report
                        </button>
                        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
                            <div className={`w-2 h-2 rounded-full ${
                                (kpis?.workingNow ?? 0) > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
                            }`} />
                            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                                {(kpis?.workingNow ?? 0) > 0
                                    ? `${kpis?.workingNow} working now`
                                    : 'No active timers'}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {canViewWorkspaces && (
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                {/* <FolderKanban size={18} className="text-blue-500" /> */}
                                My Workspaces
                            </h2>
                            <p className="text-slate-400 text-xs font-medium mt-0.5">
                                Workspaces you belong to as a member or admin.
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/workspaces')}
                            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                            View all <ExternalLink size={12} />
                        </button>
                    </div>

                    {workspaces.length === 0 ? (
                        <div className="bg-white border border-dashed border-slate-200 rounded-[2rem] p-10 text-center">
                            <Globe size={28} className="mx-auto text-slate-300 mb-3" />
                            <p className="text-sm font-bold text-slate-600">No workspaces yet</p>
                            <p className="text-xs text-slate-400 mt-1">
                                Ask an admin to invite you to a workspace.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {workspaces.map((ws) => {
                                const role = myRoleInWorkspace(ws);
                                return (
                                    <button
                                        key={ws.id}
                                        type="button"
                                        onClick={() => handleOpenWorkspace(ws)}
                                        className="group text-left bg-white p-6 rounded-[1.75rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:border-blue-100 hover:-translate-y-0.5 transition-all duration-300"
                                    >
                                        <div className="flex items-start justify-between gap-3 mb-6">
                                            <div className="min-w-0">
                                                <h3 className="font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                                                    {ws.name}
                                                </h3>
                                                <p className="text-[11px] font-mono text-slate-400 mt-0.5 truncate">
                                                    /{ws.slug}
                                                </p>
                                            </div>
                                            <span className={`shrink-0 text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-lg ${
                                                role === 'owner'
                                                    ? 'bg-amber-50 text-amber-600'
                                                    : role === 'admin'
                                                    ? 'bg-blue-50 text-blue-600'
                                                    : 'bg-slate-50 text-slate-500'
                                            }`}>
                                                {role}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex -space-x-1.5">
                                                {ws.members?.slice(0, 4).map((member: any) => (
                                                    <div
                                                        key={member.id}
                                                        className="w-7 h-7 rounded-full bg-blue-50 border-2 border-white flex items-center justify-center shadow-sm"
                                                        title={member.name}
                                                    >
                                                        <span className="text-[9px] font-bold text-blue-600 uppercase">
                                                            {getInitials(member.name)}
                                                        </span>
                                                    </div>
                                                ))}
                                                {(ws.members?.length || 0) > 4 && (
                                                    <div className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center">
                                                        <span className="text-[8px] font-bold text-slate-500">
                                                            +{(ws.members?.length || 0) - 4}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-[11px] font-bold text-slate-400 tabular-nums">
                                                {ws.projectsCount ?? ws.projects?.length ?? 0} projects
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </section>
            )}

            {!isAdminView && (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <OverviewStat
                            label="Timer"
                            value={String(kpis?.timerStatus ?? 'offline')}
                            icon={<Clock3 size={20} />}
                            trend="Live status"
                            isUp={(kpis?.timerStatus ?? 'offline') === 'working'}
                            onClick={() => navigate('/attendances')}
                        />
                        <OverviewStat
                            label="Days MTD"
                            value={kpis?.attendanceDaysMtd ?? 0}
                            icon={<CalendarDays size={20} />}
                            trend="This month"
                            isUp
                            onClick={() => navigate('/attendances')}
                        />
                        <OverviewStat
                            label="Pending Leave"
                            value={kpis?.pendingLeaves ?? 0}
                            icon={<FileText size={20} />}
                            trend="Awaiting review"
                            isUp={(kpis?.pendingLeaves ?? 0) === 0}
                            onClick={() => navigate('/leave-requests')}
                        />
                        <OverviewStat
                            label="Payslips"
                            value={kpis?.payslipsThisMonth ?? 0}
                            icon={<Wallet size={20} />}
                            trend="This month"
                            isUp
                            onClick={() => navigate('/my-profile')}
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <MyContractCard
                            contract={dashboard?.contract}
                            generating={generatingContract}
                            onGenerate={handleGenerateContract}
                        />
                        <MyIdCardCard
                            idCard={dashboard?.idCard}
                            generating={generatingIdCard}
                            onGenerate={handleGenerateIdCard}
                        />
                    </div>
                </>
            )}

            {isAdminView && (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <OverviewStat
                            label="Active Users"
                            value={kpis?.activeUsers ?? 0}
                            icon={<Users size={20} />}
                            trend={`${kpis?.workingNow ?? 0} working now`}
                            isUp={(kpis?.workingNow ?? 0) > 0}
                            onClick={() => navigate('/users')}
                        />
                        <OverviewStat
                            label="Pending Leave"
                            value={kpis?.pendingLeaves ?? 0}
                            icon={<CalendarDays size={20} />}
                            trend="Needs approval"
                            isUp={(kpis?.pendingLeaves ?? 0) === 0}
                            onClick={() => navigate('/leave-requests')}
                        />
                        <OverviewStat
                            label="Attendance MTD"
                            value={kpis?.attendanceDaysMtd ?? 0}
                            icon={<Clock3 size={20} />}
                            trend="Days logged"
                            isUp
                            onClick={() => navigate('/attendances')}
                        />
                        <OverviewStat
                            label="Payroll Net"
                            value={`₱${formatCurrency(kpis?.netPayrollMtd ?? 0)}`}
                            icon={<Wallet size={20} />}
                            trend={`${kpis?.payslipsThisMonth ?? 0} payslips`}
                            isUp
                            onClick={() => navigate('/payrolls')}
                        />
                    </div>

                    {(kpis?.openDisputes ?? 0) > 0 && (
                        <button
                            type="button"
                            onClick={() => navigate('/attendances')}
                            className="w-full text-left rounded-2xl border border-amber-200 bg-amber-50/70 px-5 py-4 flex items-center gap-3 hover:bg-amber-50 transition-colors"
                        >
                            <AlertCircle size={18} className="text-amber-600" />
                            <div>
                                <p className="text-sm font-bold text-slate-800">
                                    {kpis?.openDisputes} open attendance dispute{(kpis?.openDisputes ?? 0) === 1 ? '' : 's'}
                                </p>
                                <p className="text-xs text-slate-500">Review timesheet corrections before payroll.</p>
                            </div>
                        </button>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Activity size={80} />
                                </div>
                                <div className="flex justify-between items-start mb-8 relative z-10">
                                    <div>
                                        <h3 className="font-bold text-xl text-slate-800">Weekly Leave Activity</h3>
                                        <p className="text-slate-400 text-xs font-medium mt-1">
                                            Leave requests submitted this week
                                        </p>
                                    </div>
                                </div>
                                <div className="h-72 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={leaveActivity}>
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

                            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                        <Activity size={18} className="text-blue-500" />
                                        Role Distribution
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={() => navigate('/roles')}
                                        className="text-slate-400 hover:text-blue-500 transition-colors"
                                    >
                                        <ExternalLink size={16} />
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {roleDistribution.length > 0 ? roleDistribution.slice(0, 3).map((item) => (
                                        <div key={item.name} className="p-5 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:border-blue-100 transition-all group">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-blue-500">{item.name}</p>
                                            <div className="flex justify-between items-end">
                                                <p className="text-2xl font-black text-slate-800">{item.count}</p>
                                                <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden mb-2">
                                                    <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${(item.count / totalRoleUsers) * 100}%` }} />
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="col-span-3 text-center py-4 text-slate-400 text-xs font-medium">No roles defined</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                                <h3 className="font-bold text-slate-800 mb-4 text-sm flex items-center gap-2">
                                    <Plus size={16} className="text-blue-500" />
                                    Global Shortcuts
                                </h3>
                                <div className="space-y-2">
                                    <ActionButton
                                        icon={<Users size={18}/>}
                                        label="Onboard User"
                                        primary
                                        onClick={() => navigate('/users')}
                                    />
                                    <ActionButton
                                        icon={<CalendarDays size={18}/>}
                                        label="Manage Schedules"
                                        onClick={() => navigate('/schedules')}
                                    />
                                    <ActionButton
                                        icon={<FileText size={18}/>}
                                        label="Export Reports"
                                        onClick={() => navigate('/reports')}
                                    />
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex-1">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                        <History size={16} className="text-blue-500" />
                                        Audit Log
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={() => navigate('/activity-logs')}
                                        className="text-[9px] font-black text-blue-500 px-2 py-0.5 bg-blue-50 rounded-full uppercase tracking-tighter"
                                    >
                                        View all
                                    </button>
                                </div>
                                <div className="space-y-6">
                                    {recentActivity.length > 0 ? recentActivity.slice(0, 5).map((item) => (
                                        <ActivityItem
                                            key={item.id}
                                            user={getInitials(item.causerName || 'SYS')}
                                            name={item.causerName || 'System'}
                                            action={item.description}
                                            time={item.time || ''}
                                        />
                                    )) : (
                                        <p className="text-xs text-slate-400 text-center py-6">No recent activity yet.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

const OverviewStat = ({ label, value, icon, trend, isUp, onClick }: StatProps) => (
    <button
        type="button"
        onClick={onClick}
        className="text-left bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden w-full"
    >
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
                <p className="text-3xl font-black text-slate-900 tracking-tight truncate">{value}</p>
            </div>
        </div>
    </button>
);

const ActionButton = ({
    icon,
    label,
    primary,
    onClick,
}: {
    icon: React.ReactNode;
    label: string;
    primary?: boolean;
    onClick?: () => void;
}) => (
    <button
        type="button"
        onClick={onClick}
        className={`w-full flex items-center justify-between p-3.5 rounded-xl transition-all group ${
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
            <p className="text-[11px] text-slate-500 font-medium tracking-tight leading-none mt-1 truncate">{action}</p>
        </div>
    </div>
);

const OverviewSkeleton = () => (
    <div className="p-8 text-slate-400 animate-pulse font-black uppercase tracking-widest">
        Initialising System...
    </div>
);
