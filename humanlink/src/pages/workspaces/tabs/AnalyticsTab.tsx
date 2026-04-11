import { usePageTitle } from '@/hooks/use-title';
import { getInitials } from '@/utils/userUtils';
import { Target, Users2, Layers, CheckCircle2, ArrowUpRight, PieChart, Trophy } from 'lucide-react';
import { useEffect } from 'react';

interface AnalyticsProps {
    workspace: any; 
}

export default function AnalyticsTab({ workspace }: AnalyticsProps) {
    usePageTitle("Analytics")
    const projects = workspace?.projects || [];
    const members = workspace?.members || [];
    const statuses = workspace?.task_statuses || [];
    const workspaceName = workspace?.name || 'Workspace';

    const doneStatus = statuses.find((s: any) => s.name === 'Done');
    const doneStatusId = doneStatus?.id;

    const totalTasks = projects.reduce((acc: number, p: any) => acc + (p.tasks?.length || 0), 0);
    const completedTasks = projects.reduce((acc: number, p: any) => {
        const doneInProject = p.tasks?.filter((t: any) => t.statusId === doneStatusId).length || 0;
        // return acc + doneInProject;
        return acc + doneInProject;
    }, 0);

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const memberStats = members.map((member: any) => {
        const completedCount = projects.reduce((acc: number, project: any) => {
            const memberDone = project.tasks?.filter((t: any) => 
                t.statusId === doneStatusId && t.assigned_to === member.id
            ).length || 0;
            return acc + memberDone;
        }, 0);
        return { ...member, completedCount };
    }).sort((a: any, b: any) => b.completedCount - a.completedCount).slice(0, 5);

    const statusCounts = statuses.map((status: any) => {
        const count = projects.reduce((acc: number, p: any) => 
            acc + (p.tasks?.filter((t: any) => t.statusId === status.id).length || 0), 0
        );
        return { ...status, count };
    });
    
    const workloadData = members.map((member: any) => {
        const activeTasksCount = projects.reduce((acc: number, project: any) => {
            const memberActive = project.tasks?.filter((t: any) => 
                t.statusId !== doneStatusId && t.assigned_to === member.id
            ).length || 0;
            return acc + memberActive;
        }, 0);

        const capacityLimit = 8; 
        const workloadPercentage = Math.min(Math.round((activeTasksCount / capacityLimit) * 100), 100);
        
        return { ...member, activeTasksCount, workloadPercentage };
    });
    
    useEffect(() => {
        // console.log('ddddd', workloadData)
    }, []);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 h-full flex flex-col overflow-y-auto pr-2 custom-scrollbar">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h3 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        Workspace Analytics
                    </h3>
                    <p className="text-slate-400 text-sm mt-1 font-medium">
                       Performance overview for <span className="text-blue-600 font-semibold">{workspaceName}</span>
                    </p>
                </div>
            </div>
            
            {/* Stats Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {/* Completion Rate Card */}
                <div className="group p-6 border border-slate-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-emerald-50 rounded-lg group-hover:scale-110 transition-transform">
                            <Target className="w-5 h-5 text-emerald-600" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                            Productivity
                        </span>
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Task Completion</p>
                    <p className="text-4xl font-extrabold text-slate-900 mt-1">{completionRate}%</p>
                    
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
                        <div 
                            className="bg-emerald-500 h-full rounded-full transition-all duration-1000 ease-out" 
                            style={{ width: `${completionRate}%` }}
                        />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> 
                        {completedTasks} of {totalTasks} tasks marked as "{doneStatus?.name || 'Done'}"
                    </p>
                </div>
                
                {/* Active Projects Card */}
                <div className="group p-6 border border-slate-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-blue-50 rounded-lg group-hover:scale-110 transition-transform">
                            <Layers className="w-5 h-5 text-blue-600" />
                        </div>
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Active Projects</p>
                    <p className="text-4xl font-extrabold text-slate-900 mt-1">{projects.length}</p>
                    <p className="text-[11px] text-slate-400 mt-4 font-medium italic">
                        Real-time active initiatives
                    </p>
                </div>

                {/* Team Size Card */}
                <div className="group p-6 border border-slate-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-indigo-50 rounded-lg group-hover:scale-110 transition-transform">
                            <Users2 className="w-5 h-5 text-indigo-600" />
                        </div>
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Members</p>
                    <p className="text-4xl font-extrabold text-slate-900 mt-1">{members.length}</p>
                    <div className="flex -space-x-2 mt-4">
                        {members.slice(0, 4).map((member: any) => (
                            <div 
                                key={member.id} 
                                className="h-7 w-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 uppercase"
                                title={member.name}
                            >
                                {getInitials(member.name)}
                            </div>
                        ))}
                        {members.length > 4 && (
                            <div className="h-7 w-7 rounded-full border-2 border-white bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white">
                                +{members.length - 4}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
                {/* Project Breakdown Section */}
                <div className="p-8 border border-slate-100 rounded-3xl bg-white shadow-sm h-fit">
                    <div className="flex items-center gap-2 mb-6">
                         <Layers className="w-5 h-5 text-slate-400" />
                         <h4 className="text-lg font-bold text-slate-900">Project Progress</h4>
                    </div>
                    <div className="space-y-6">
                        {projects.map((project: any) => {
                            const pTotal = project.tasks?.length || 0;
                            const pDone = project.tasks?.filter((t: any) => t.statusId === doneStatusId).length || 0;
                            const pRate = pTotal > 0 ? Math.round((pDone / pTotal) * 100) : 0;

                            return (
                                <div key={project.id} className="flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-slate-700">{project.name}</span>
                                            <ArrowUpRight className="w-4 h-4 text-slate-300" />
                                        </div>
                                        <span className="text-sm font-bold text-slate-500">{pRate}%</span>
                                    </div>
                                    <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden">
                                        <div 
                                            className="bg-indigo-500 h-full rounded-full" 
                                            style={{ width: `${pRate}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Status Distribution (New Section) */}
                <div className="p-8 border border-slate-100 rounded-3xl bg-white shadow-sm h-fit">
                    <div className="flex items-center gap-2 mb-6">
                         <PieChart className="w-5 h-5 text-slate-400" />
                         <h4 className="text-lg font-bold text-slate-900">Task Distribution</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {statusCounts.map((status: any) => (
                            <div key={status.id} className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: status.colorHex }} />
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">{status.name}</span>
                                </div>
                                <p className="text-2xl font-bold text-slate-900">{status.count}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Top Contributors (New Section) */}
            <div className="p-8 border border-slate-100 rounded-3xl bg-white shadow-sm mb-10">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-amber-500" />
                        <h4 className="text-lg font-bold text-slate-900">Top Contributors</h4>
                    </div>
                    <span className="text-xs font-medium text-slate-400 italic">Based on completed tasks</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    {memberStats.map((member: any, index: number) => (
                        <div key={member.id} className="flex flex-col items-center text-center p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                            <div className="relative mb-3">
                                <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border-2 border-white shadow-sm">
                                    {getInitials(member.name)}
                                </div>
                                {index === 0 && (
                                    <div className="absolute -top-2 -right-2 bg-amber-400 text-white rounded-full p-1 shadow-sm">
                                        <Trophy className="w-3 h-3" />
                                    </div>
                                )}
                            </div>
                            <p className="text-sm font-bold text-slate-900 truncate w-full">{member.name}</p>
                            <p className="text-xs font-medium text-slate-400 mt-1">{member.completedCount} Tasks Done</p>
                        </div>
                    ))}
                </div>
            </div>
            
            
            
            <div className="p-8 border border-slate-100 rounded-3xl bg-white shadow-sm mb-10">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                        <Users2 className="w-5 h-5 text-indigo-500" />
                        <h4 className="text-lg font-bold text-slate-900">Workload Distribution</h4>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Capacity Heatmap</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    {workloadData.map((member: any) => (
                        <div key={member.id} className="space-y-3">
                            <div className="flex justify-between items-end">
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 border border-slate-200">
                                        {getInitials(member.name)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">{member.name}</p>
                                        <p className="text-[11px] text-slate-400 font-medium">{member.activeTasksCount} active tasks</p>
                                    </div>
                                </div>
                                <span className={`text-xs font-bold ${
                                    member.workloadPercentage > 80 ? 'text-rose-500' : 
                                    member.workloadPercentage > 50 ? 'text-amber-500' : 'text-emerald-500'
                                }`}>
                                    {member.workloadPercentage}% Cap
                                </span>
                            </div>
                            
                            {/* Heatmap Bar */}
                            <div className="relative w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full transition-all duration-1000 ease-out ${
                                        member.workloadPercentage > 80 ? 'bg-rose-500' : 
                                        member.workloadPercentage > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                                    }`}
                                    style={{ width: `${member.workloadPercentage}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            
            
        </div>
    );
}
