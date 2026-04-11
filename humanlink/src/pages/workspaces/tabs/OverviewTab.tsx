import { usePageTitle } from '@/hooks/use-title';
import { 
    FolderKanban, Kanban, Users, Activity, 
    ArrowUpRight, Clock, CheckCircle2, AlertCircle, 
    TrendingUp, Calendar
} from 'lucide-react';

interface OverviewTabProps {
    projects: any[];
}

export default function OverviewTab({ projects }: OverviewTabProps) {
    usePageTitle("Overview")

    // Logic for Project Health Distribution
    const activeProjects = projects.filter(p => p.status === 'Active' || !p.status).length;
    const completedProjects = projects.filter(p => p.status === 'Completed').length;
    
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 h-full flex flex-col space-y-6 pb-10">
            {/* --- Top Stats Row --- */}
            <div className="p-8 rounded-[2.5rem] border border-slate-200/60 bg-white shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            Workspace Intelligence
                        </h3>
                        <p className="text-sm text-slate-500 font-medium">Real-time performance metrics</p>
                    </div>
                    <div className="px-3 py-1 bg-blue-50 rounded-lg text-[10px] font-bold text-blue-600 uppercase tracking-tight">
                        v2.4 Live
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <StatCard 
                        label="Total Projects" 
                        value={projects.length.toString()} 
                        icon={FolderKanban} 
                        color="bg-blue-50 text-blue-600" 
                        trend="+2 this month"
                    />
                    <StatCard 
                        label="Active Tasks" 
                        value="148" 
                        icon={Kanban} 
                        color="bg-emerald-50 text-emerald-600" 
                        trend="84% completion"
                    />
                    <StatCard 
                        label="Team Velocity" 
                        value="8.2" 
                        icon={TrendingUp} 
                        color="bg-purple-50 text-purple-600" 
                        trend="High productivity"
                    />
                    <StatCard 
                        label="System Health" 
                        value="100%" 
                        icon={Activity} 
                        color="bg-orange-50 text-orange-600" 
                        trend="Zero downtime"
                    />
                </div>
            </div>

            {/* --- Main Dashboard Grid --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Project Status Distribution */}
                <div className="lg:col-span-2 p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <CheckCircle2 size={18} className="text-emerald-500" />
                        Project Distribution
                    </h3>
                    
                    <div className="space-y-6">
                        <div className="flex items-end gap-2 h-32">
                            {/* Simple CSS-based bar chart */}
                            <div className="flex-1 bg-blue-500 rounded-t-xl transition-all duration-1000" style={{ height: '100%' }} />
                            <div className="flex-1 bg-emerald-400 rounded-t-xl transition-all duration-1000" style={{ height: '65%' }} />
                            <div className="flex-1 bg-amber-400 rounded-t-xl transition-all duration-1000" style={{ height: '30%' }} />
                            <div className="flex-1 bg-slate-200 rounded-t-xl transition-all duration-1000" style={{ height: '45%' }} />
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-50">
                            <LegendItem label="Active" value={activeProjects} color="bg-blue-500" />
                            <LegendItem label="Completed" value={completedProjects} color="bg-emerald-400" />
                            <LegendItem label="On Hold" value="2" color="bg-amber-400" />
                            <LegendItem label="Planning" value="5" color="bg-slate-300" />
                        </div>
                    </div>
                </div>

                {/* Recent Activity Mini-Feed */}
                <div className="p-8 rounded-[2.5rem] bg-slate-900 text-white shadow-xl">
                    <h3 className="font-bold mb-6 flex items-center gap-2 text-sm">
                        <Clock size={16} className="text-blue-400" />
                        Quick Insights
                    </h3>
                    <div className="space-y-6">
                        <InsightRow 
                            title="Deadline Approaching" 
                            desc="Project 'Alpha' due in 2 days" 
                            icon={<AlertCircle size={14} />} 
                            type="warning" 
                        />
                        <InsightRow 
                            title="New Team Member" 
                            desc="Sarah joined 'Nexus UI'" 
                            icon={<Users size={14} />} 
                            type="info" 
                        />
                        <InsightRow 
                            title="Milestone Reached" 
                            desc="Database migration 100%" 
                            icon={<CheckCircle2 size={14} />} 
                            type="success" 
                        />
                    </div>
                    
                    <button className="w-full mt-10 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition-all text-[11px] font-bold uppercase tracking-widest">
                        View All Activity
                    </button>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon: Icon, color, trend }: any) {
    return (
        <div className="group p-5 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:border-blue-200 hover:shadow-md transition-all duration-300">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon size={20} />
            </div>
            <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{label}</p>
            <div className="mt-4 pt-3 border-t border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[9px] font-bold text-slate-500 uppercase">{trend}</span>
            </div>
        </div>
    );
}

function LegendItem({ label, value, color }: any) {
    return (
        <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
                <div className={`w-2 h-2 rounded-full ${color}`} />
                <span className="text-[10px] font-bold text-slate-400 uppercase">{label}</span>
            </div>
            <span className="text-lg font-bold text-slate-800">{value}</span>
        </div>
    );
}

function InsightRow({ title, desc, icon, type }: any) {
    const colors = {
        warning: "text-amber-400",
        success: "text-emerald-400",
        info: "text-blue-400"
    };
    return (
        <div className="flex gap-4">
            <div className={`mt-1 ${colors[type as keyof typeof colors]}`}>
                {icon}
            </div>
            <div>
                <p className="text-xs font-bold text-white tracking-tight">{title}</p>
                <p className="text-[11px] text-slate-400 font-medium">{desc}</p>
            </div>
        </div>
    );
}
