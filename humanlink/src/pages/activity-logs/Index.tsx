import { useMemo, useState, useEffect } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { History, Shield } from 'lucide-react';
import { DataTable } from '@/components/shared/Datatable';
import { DateCell, TextCell, UserCell } from '@/components/shared/TableCells';
import api from '@/api/axios';
import type { ActivityLog } from '@/types';
import { API_ROUTES } from '@/constants';

const columnHelper = createColumnHelper<ActivityLog>();

export default function ActivityLogIndex() {
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(API_ROUTES.ACTIVITY_LOGS.LIST)
            .then((res) => setActivities(res.data.data))
            .finally(() => setLoading(false));
    }, []);

    const columns = useMemo(() => [
        columnHelper.accessor('causer', {
            header: 'User',
            cell: (info) => {
                const causer = info.getValue();
                return (
                    <UserCell
                        name={causer?.name || 'System'}
                        email={causer?.email || 'automated-task'}
                    />
                );
            },
        }),
        columnHelper.accessor('description', {
            header: 'Action',
            cell: (info) => {
                const action = info.getValue();
                const colors: Record<string, string> = {
                    created: 'text-emerald-600 bg-emerald-50/50 border-emerald-100/50',
                    updated: 'text-amber-600 bg-amber-50/50 border-amber-100/50',
                    deleted: 'text-rose-600 bg-rose-50/50 border-rose-100/50',
                };

                return (
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${colors[action] || 'text-slate-600 bg-slate-50 border-slate-100'}`}>
                        {action}
                    </span>
                );
            },
        }),
        columnHelper.accessor('subjectType', {
            header: 'Resource',
            cell: (info) => (
                <div className="flex items-center gap-2">
                    <Shield size={12} className="text-blue-600 shrink-0" />
                    <TextCell title={info.getValue().split('\\').pop() || '—'} />
                </div>
            ),
        }),
        columnHelper.accessor('createdAt', {
            header: 'When',
            cell: (info) => <DateCell date={info.getValue()} />,
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
                showSearch={true}
                countLabel={`${activities.length} ${activities.length === 1 ? 'event' : 'events'}`}
            />
        </div>
    );
}
