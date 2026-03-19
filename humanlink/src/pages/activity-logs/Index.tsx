import { useMemo, useState, useEffect } from 'react';
import { createColumnHelper } from "@tanstack/react-table";
import { History, Shield, Clock, Activity } from 'lucide-react';
import { DataTable } from '@/components/Datatable';
import api from '@/api/axios';
import type { ActivityLog } from '@/types/models';
import { API_ROUTES } from '@/constants';

// const API_ROUTES = {
//     ACTIVITY_LOGS: '/activity-logs',
// };

// interface ActivityLog {
//     id: number;
//     description: string;
//     subjectType: string;
//     properties: {
//         attributes?: Record<string, any>;
//         old?: Record<string, any>;
//     };
//     causer: {
//         name: string;
//         email: string;
//         color?: string;
//     } | null;
//     createdAt: string;
// }

const columnHelper = createColumnHelper<ActivityLog>();

export default function ActivityLogIndex() {
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(API_ROUTES.ACTIVITY_LOGS.LIST)
           .then(res => setActivities(res.data.data))
           .finally(() => setLoading(false));
    }, []);

    const columns = useMemo(() => [
        columnHelper.accessor('causer', {
            header: 'User Identity',
            cell: (info) => {
                const causer = info.getValue();
                const name = causer?.name || 'System';
                const email = causer?.email || 'automated-task';
                
                return (
                    <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 ${causer?.color || 'bg-slate-500'} rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-slate-100`}>
                            {name.charAt(0)}
                        </div>
                        <div>
                            <p className="font-bold text-slate-800 text-sm">{name}</p>
                            <p className="text-[11px] text-slate-400 font-medium">{email}</p>
                        </div>
                    </div>
                );
            },
        }),
        columnHelper.accessor('description', {
            header: 'Action',
            cell: (info) => {
                const action = info.getValue();
                const colors: Record<string, string> = {
                    created: 'text-green-600 bg-green-50 border-green-100',
                    updated: 'text-amber-600 bg-amber-50 border-amber-100',
                    deleted: 'text-red-600 bg-red-50 border-red-100',
                };
                
                return (
                    <div className={`flex items-center gap-2 w-fit px-3 py-1 rounded-full border ${colors[action] || 'text-slate-600 bg-slate-50 border-slate-100'}`}>
                        <Activity size={12} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                            {action}
                        </span>
                    </div>
                );
            },
        }),
        columnHelper.accessor('properties', {
            header: 'Metadata (JSON)',
            cell: (info) => {
                const props = info.getValue();
                
                if (!props || Object.keys(props).length === 0) {
                    return <span className="text-[10px] text-slate-300 font-bold italic uppercase tracking-tighter">Empty</span>;
                }

                const jsonString = JSON.stringify(props, null, 2);

                return (
                    <div className="relative group max-w-[300px]">
                        <div className="flex items-center justify-between px-3 py-1 bg-[#252525] rounded-t-xl border border-slate-800/50 border-b-0">
                            <div className="flex gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-400/30 group-hover:bg-red-400/80 transition-all" />
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-400/30 group-hover:bg-amber-400/80 transition-all" />
                                <div className="w-1.5 h-1.5 rounded-full bg-green-400/30 group-hover:bg-green-400/80 transition-all" />
                            </div>
                            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">JSON</span>
                        </div>

                        <div className="bg-[#1e1e1e] rounded-b-xl p-2.5 font-mono text-[9.5px] leading-[1.4] border border-slate-800/50 overflow-hidden shadow-sm">
                            <pre className="text-[#d4d4d4] overflow-x-auto scrollbar-hide">
                                {jsonString.split('\n').map((line, i) => {
                                    const highlightedLine = line
                                        .replace(/"(\w+)":/g, '<span class="text-[#9cdcfe]">"$1"</span>:')
                                        .replace(/: "(.*)"/g, ': <span class="text-[#ce9178]">"$1"</span>')
                                        .replace(/: (null|true|false)/g, ': <span class="text-[#569cd6]">$1</span>');

                                    return (
                                        <div key={i} className="flex gap-3 group/line">
                                            <span className="text-slate-700 text-right w-2 select-none opacity-40 group-hover/line:opacity-100">
                                                {i + 1}
                                            </span>
                                            <span dangerouslySetInnerHTML={{ __html: highlightedLine }} />
                                        </div>
                                    );
                                })}
                            </pre>
                        </div>
                    </div>
                );
            },
        }),
        columnHelper.accessor('subjectType', {
            header: 'Resource',
            cell: (info) => (
                <div className="flex items-center gap-2">
                    <Shield size={12} className="text-blue-600" />
                    <span className="text-xs font-bold text-slate-500 capitalize">
                        {info.getValue().split('\\').pop()}
                    </span>
                </div>
            ),
        }),
        columnHelper.accessor('createdAt', {
            header: 'Timestamp',
            cell: (info) => (
                <div className="flex items-center gap-2">
                    <Clock size={12} className="text-slate-300" />
                    <span className="text-xs font-bold text-slate-500">
                        {new Date(info.getValue()).toLocaleString()}
                    </span>
                </div>
            ),
        }),
    ], []);

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 text-slate-600">
                        <History size={24} className="text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">System Activity</h1>
                        <p className="text-slate-400 text-sm font-medium">Audit trail of all system changes</p>
                    </div>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={activities}
                loading={loading}
                showSearch={false}
            />
        </div>
    );
}