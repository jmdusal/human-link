import { useEffect, useState } from 'react';
import {
    FolderKanban, Kanban, Users, Activity,
    CheckCircle2, AlertCircle, History,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import { usePageTitle } from '@/hooks/use-title';
import { WorkspaceService, type WorkspaceActivityItem } from '@/services/WorkspaceService';
import { getInitials } from '@/utils/userUtils';
import {
    findDoneStatus,
    getDoneStatusIds,
    isTaskDone,
    resolveWorkspaceStatuses,
} from '@/utils/workspaceMetrics';

interface OverviewTabProps {
    workspace: any;
    projects: any[];
}

export default function OverviewTab({ workspace, projects }: OverviewTabProps) {
    usePageTitle('Overview');
    const [activity, setActivity] = useState<WorkspaceActivityItem[]>([]);
    const [activityLoading, setActivityLoading] = useState(true);

    const members = workspace?.members || [];
    const statuses = resolveWorkspaceStatuses(workspace);
    const doneStatus = findDoneStatus(statuses);
    const doneStatusIds = getDoneStatusIds(statuses);

    useEffect(() => {
        if (!workspace?.id) return;

        let cancelled = false;
        setActivityLoading(true);

        WorkspaceService.getActivity(workspace.id)
            .then((items) => {
                if (!cancelled) setActivity(items);
            })
            .catch(() => {
                if (!cancelled) setActivity([]);
            })
            .finally(() => {
                if (!cancelled) setActivityLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [workspace?.id]);

    const totalTasks = projects.reduce((acc: number, p: any) => acc + (p.tasks?.length || 0), 0);
    const completedTasks = projects.reduce((acc: number, p: any) => {
        const doneInProject = p.tasks?.filter((t: any) => isTaskDone(t, doneStatusIds)).length || 0;
        return acc + doneInProject;
    }, 0);
    const activeTasks = Math.max(totalTasks - completedTasks, 0);
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const activeProjects = projects.filter((p) => {
        const status = String(p.status || '').toLowerCase();
        return status === 'active' || status === '' || !p.status;
    }).length;
    const completedProjects = projects.filter((p) =>
        String(p.status || '').toLowerCase() === 'completed'
    ).length;

    const statusBars = [
        { label: 'Active', count: activeProjects, color: 'bg-blue-500' },
        { label: 'Completed', count: completedProjects, color: 'bg-emerald-400' },
        { label: 'Other', count: Math.max(projects.length - activeProjects - completedProjects, 0), color: 'bg-slate-200' },
    ];
    const maxBar = Math.max(...statusBars.map((item) => item.count), 1);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 h-full flex flex-col space-y-6 pb-10">
            <Card variant="section">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            Workspace Intelligence
                        </h3>
                        <p className="text-sm text-slate-500 font-medium">Live project and task metrics</p>
                    </div>
                    <div className="px-3 py-1 bg-emerald-50 rounded-lg text-[10px] font-bold text-emerald-600 uppercase tracking-tight">
                        Live
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <StatCard
                        label="Total Projects"
                        value={projects.length.toString()}
                        icon={FolderKanban}
                        color="bg-blue-50 text-blue-600"
                        trend={`${activeProjects} active`}
                    />
                    <StatCard
                        label="Active Tasks"
                        value={String(activeTasks)}
                        icon={Kanban}
                        color="bg-emerald-50 text-emerald-600"
                        trend={`${completionRate}% complete`}
                    />
                    <StatCard
                        label="Team Members"
                        value={String(members.length)}
                        icon={Users}
                        color="bg-indigo-50 text-indigo-600"
                        trend="In workspace"
                    />
                    <StatCard
                        label="Completion"
                        value={`${completionRate}%`}
                        icon={Activity}
                        color="bg-orange-50 text-orange-600"
                        trend={`${completedTasks}/${totalTasks} tasks`}
                    />
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card variant="section" className="lg:col-span-2">
                    <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <CheckCircle2 size={18} className="text-emerald-500" />
                        Project Distribution
                    </h3>

                    <div className="space-y-6">
                        <div className="flex items-end gap-2 h-32">
                            {statusBars.map((item) => (
                                <div
                                    key={item.label}
                                    className={`flex-1 ${item.color} rounded-t-xl transition-all duration-1000`}
                                    style={{ height: `${Math.max((item.count / maxBar) * 100, item.count > 0 ? 12 : 4)}%` }}
                                    title={`${item.label}: ${item.count}`}
                                />
                            ))}
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {statusBars.map((item) => (
                                <div key={item.label} className="rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{item.label}</p>
                                    <p className="text-lg font-black text-slate-800">{item.count}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>

                <Card variant="section">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <AlertCircle size={18} className="text-blue-500" />
                        Quick Insights
                    </h3>
                    <ul className="space-y-3 text-sm text-slate-600">
                        <li className="flex justify-between gap-3 border-b border-slate-100 pb-2">
                            <span>Completed projects</span>
                            <span className="font-bold text-slate-800">{completedProjects}</span>
                        </li>
                        <li className="flex justify-between gap-3 border-b border-slate-100 pb-2">
                            <span>Open tasks</span>
                            <span className="font-bold text-slate-800">{activeTasks}</span>
                        </li>
                        <li className="flex justify-between gap-3">
                            <span>Done status</span>
                            <span className="font-bold text-slate-800">{doneStatus?.name || '—'}</span>
                        </li>
                    </ul>
                </Card>
            </div>

            <Card variant="section">
                <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <History size={18} className="text-blue-500" />
                    Recent Activity
                </h3>
                <div className="space-y-5">
                    {activityLoading ? (
                        <p className="text-xs text-slate-400 text-center py-6">Loading activity...</p>
                    ) : activity.length > 0 ? (
                        activity.slice(0, 10).map((item) => (
                            <div key={item.id} className="flex gap-4 relative group">
                                <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 shrink-0 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-300">
                                    {getInitials(item.user?.name || 'SYS')}
                                </div>
                                <div className="flex flex-col min-w-0 justify-center">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[13px] font-bold text-slate-800 truncate">
                                            {item.user?.name || 'System'}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">
                                            {item.time || ''}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 font-medium tracking-tight leading-snug mt-1">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-xs text-slate-400 text-center py-6">
                            No recent comments or task updates yet.
                        </p>
                    )}
                </div>
            </Card>
        </div>
    );
}

function StatCard({
    label,
    value,
    icon: Icon,
    color,
    trend,
}: {
    label: string;
    value: string;
    icon: any;
    color: string;
    trend: string;
}) {
    return (
        <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                <Icon size={18} />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{value}</p>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">{trend}</p>
        </div>
    );
}
