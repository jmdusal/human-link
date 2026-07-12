import { useEffect, useMemo, useState } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { Building2, History, Shield } from 'lucide-react';
import { DataTable } from '@/components/shared/Datatable';
import Searchbar from '@/components/shared/Searchbar';
import Select from '@/components/ui/Select';
import { DateCell, TextCell, UserCell } from '@/components/shared/TableCells';
import api from '@/api/axios';
import { useAuth } from '@/context/AuthContext';
import { API_ROUTES } from '@/constants';
import type { ActivityLog } from '@/types';

const columnHelper = createColumnHelper<ActivityLog>();

type EventFilter = 'all' | 'created' | 'updated' | 'deleted';

const EVENT_FILTERS: { value: EventFilter; label: string }[] = [
    { value: 'all', label: 'All events' },
    { value: 'created', label: 'Created' },
    { value: 'updated', label: 'Updated' },
    { value: 'deleted', label: 'Deleted' },
];

const EVENT_BADGE: Record<string, string> = {
    created: 'text-emerald-600 bg-emerald-50/50 border-emerald-100/50',
    updated: 'text-amber-600 bg-amber-50/50 border-amber-100/50',
    deleted: 'text-rose-600 bg-rose-50/50 border-rose-100/50',
};

export default function ActivityLogIndex() {
    const { user } = useAuth();
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [eventFilter, setEventFilter] = useState<EventFilter>('all');

    useEffect(() => {
        let cancelled = false;
        setLoading(true);

        api.get(API_ROUTES.ACTIVITY_LOGS.LIST)
            .then((res) => {
                if (!cancelled) setActivities(res.data.data ?? []);
            })
            .catch(() => {
                if (!cancelled) setActivities([]);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [user?.company_id]);

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();

        return activities.filter((item) => {
            if (eventFilter !== 'all' && item.event !== eventFilter) {
                return false;
            }

            if (!query) return true;

            const haystack = [
                item.summary,
                item.description,
                item.resource,
                item.subjectLabel,
                item.subjectType,
                item.company?.name,
                item.causer?.name,
                item.causer?.email,
                ...(item.changes ?? []).flatMap((change) => [change.field, change.old, change.new]),
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            return haystack.includes(query);
        });
    }, [activities, search, eventFilter]);

    const columns = useMemo(() => [
        columnHelper.accessor((row) => row.causer?.name ?? 'System', {
            id: 'user',
            header: 'User',
            cell: (info) => {
                const causer = info.row.original.causer;
                return (
                    <UserCell
                        name={causer?.name || 'System'}
                        email={causer?.email || 'automated-task'}
                    />
                );
            },
        }),
        columnHelper.accessor('event', {
            header: 'Action',
            cell: (info) => {
                const event = info.getValue();
                const classes = EVENT_BADGE[event] || 'text-slate-600 bg-slate-50 border-slate-100';

                return (
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${classes}`}>
                        {event}
                    </span>
                );
            },
        }),
        columnHelper.accessor('resource', {
            header: 'Resource',
            cell: (info) => {
                const row = info.row.original;
                return (
                    <div className="flex items-center gap-2 min-w-0">
                        <Shield size={12} className="text-blue-600 shrink-0" />
                        <div className="flex flex-col min-w-0">
                            <span className="text-[14px] font-bold text-slate-700 leading-tight tracking-tight truncate">
                                {info.getValue()}
                            </span>
                            {row.subjectLabel && (
                                <span className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                                    {row.subjectLabel}
                                </span>
                            )}
                        </div>
                    </div>
                );
            },
        }),
        columnHelper.accessor('summary', {
            header: 'Summary',
            cell: (info) => {
                const row = info.row.original;
                const changeCount = row.changes?.length ?? 0;

                return (
                    <div className="flex flex-col min-w-0 max-w-md">
                        <span className="text-[13px] font-semibold text-slate-700 leading-snug truncate">
                            {info.getValue()}
                        </span>
                        {changeCount > 0 && (
                            <span className="text-[11px] text-slate-400 font-medium mt-0.5">
                                {changeCount} {changeCount === 1 ? 'field changed' : 'fields changed'}
                                {row.changes.slice(0, 2).map((change) => (
                                    <span key={`${row.id}-${change.field}`} className="ml-1">
                                        · {change.field}
                                    </span>
                                ))}
                                {changeCount > 2 ? ' · …' : ''}
                            </span>
                        )}
                    </div>
                );
            },
        }),
        columnHelper.accessor((row) => row.company?.name ?? '', {
            id: 'company',
            header: 'Company',
            cell: (info) => {
                const company = info.row.original.company;

                if (!company?.name) {
                    return <TextCell title="—" />;
                }

                return (
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-100/50">
                        <Building2 size={12} className="text-slate-400 shrink-0" />
                        <span className="text-[11px] font-semibold text-slate-600 tracking-tight whitespace-nowrap">
                            {company.name}
                        </span>
                    </div>
                );
            },
        }),
        columnHelper.accessor('createdAt', {
            header: 'When',
            cell: (info) => (
                <div className="flex flex-col gap-1">
                    <DateCell date={info.getValue()} />
                    {info.row.original.time && (
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider pl-1">
                            {info.row.original.time}
                        </span>
                    )}
                </div>
            ),
        }),
    ], []);

    const filterToolbar = (
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="max-w-sm w-full sm:w-64">
                <Searchbar
                    value={search}
                    onChange={setSearch}
                    placeholder="Search audit logs..."
                />
            </div>
            <div className="w-full sm:w-[200px]">
                <Select
                    value={eventFilter}
                    onChange={(value) => setEventFilter(value as EventFilter)}
                    options={EVENT_FILTERS}
                />
            </div>
        </div>
    );

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Audit Logs</h1>
                        <p className="text-slate-400 text-sm font-medium">Audit trail of system changes by company.</p>
                    </div>
                </div>
            </div>

            {!loading && (
                <div className="mb-6">
                    {filterToolbar}
                </div>
            )}

            <DataTable
                columns={columns}
                data={filtered}
                loading={loading}
                showSearch={false}
                countLabel={`${filtered.length} ${filtered.length === 1 ? 'event' : 'events'}`}
            />
        </div>
    );
}
