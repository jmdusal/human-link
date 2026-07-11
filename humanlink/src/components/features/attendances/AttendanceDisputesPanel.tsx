import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Check, X } from 'lucide-react';
import { createColumnHelper } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/Datatable';
import TableActions from '@/components/shared/TableActions';
import { TextCell, UserCell } from '@/components/shared/TableCells';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { AttendanceDisputeService } from '@/services/AttendanceDisputeService';
import type { AttendanceDispute } from '@/types';
import { formatDisplayDate } from '@/utils/dateUtils';

const columnHelper = createColumnHelper<AttendanceDispute>();

function formatHours(ms?: number | null): string {
    if (ms == null) return '—';
    return `${(ms / 3_600_000).toFixed(2)}h`;
}

export default function AttendanceDisputesPanel() {
    const { can, hasRole, user } = useAuth();
    const canReview = hasRole('super-admin') || user?.userType === 'hr' || can('attendance-disputes-edit') || can('users-edit');

    const [disputes, setDisputes] = useState<AttendanceDispute[]>([]);
    const [loading, setLoading] = useState(true);
    const [actingId, setActingId] = useState<number | null>(null);

    const fetchDisputes = async () => {
        setLoading(true);
        try {
            const data = await AttendanceDisputeService.list();
            setDisputes(data);
        } catch {
            toast.error('Failed to load disputes.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDisputes();
    }, []);

    const handleApprove = async (dispute: AttendanceDispute) => {
        setActingId(dispute.id);
        try {
            const updated = await AttendanceDisputeService.approve(dispute.id);
            setDisputes((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
            toast.success('Dispute approved and attendance updated.');
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to approve dispute.');
        } finally {
            setActingId(null);
        }
    };

    const handleReject = async (dispute: AttendanceDispute) => {
        const note = window.prompt('Rejection note (optional):') ?? undefined;
        setActingId(dispute.id);
        try {
            const updated = await AttendanceDisputeService.reject(dispute.id, note || undefined);
            setDisputes((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
            toast.success('Dispute rejected.');
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to reject dispute.');
        } finally {
            setActingId(null);
        }
    };

    const columns = [
        columnHelper.accessor((row) => row.user?.name ?? 'Unknown', {
            id: 'employee',
            header: 'Employee',
            cell: (info) => (
                <UserCell
                    name={info.getValue()}
                    email={info.row.original.user?.email ?? ''}
                />
            ),
        }),
        columnHelper.accessor((row) => row.attendance?.date ?? '', {
            id: 'date',
            header: 'Date',
            cell: (info) => <TextCell title={info.getValue() ? formatDisplayDate(info.getValue()) : '—'} />,
        }),
        columnHelper.accessor('reason', {
            header: 'Reason',
            cell: (info) => <TextCell title={info.getValue()} />,
        }),
        columnHelper.display({
            id: 'proposed',
            header: 'Proposed',
            cell: (info) => (
                <TextCell
                    title={`${formatHours(info.row.original.proposedTotalMs)} / OT ${formatHours(info.row.original.proposedOvertimeMs)}`}
                />
            ),
        }),
        columnHelper.accessor('status', {
            header: 'Status',
            cell: (info) => (
                <span className={`text-xs font-bold uppercase tracking-wider ${
                    info.getValue() === 'approved'
                        ? 'text-emerald-600'
                        : info.getValue() === 'rejected'
                            ? 'text-rose-600'
                            : 'text-amber-600'
                }`}>
                    {info.getValue()}
                </span>
            ),
        }),
        columnHelper.display({
            id: 'actions',
            header: () => <div className="text-right">Actions</div>,
            cell: (info) => {
                const dispute = info.row.original;
                if (!canReview || dispute.status !== 'pending') {
                    return null;
                }

                return (
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="secondary"
                            icon={Check}
                            loading={actingId === dispute.id}
                            onClick={() => handleApprove(dispute)}
                        >
                            Approve
                        </Button>
                        <Button
                            variant="danger"
                            icon={X}
                            loading={actingId === dispute.id}
                            onClick={() => handleReject(dispute)}
                        >
                            Reject
                        </Button>
                    </div>
                );
            },
        }),
    ];

    if (!canReview && disputes.length === 0 && !loading) {
        return null;
    }

    return (
        <div className="mt-8 space-y-4">
            <div>
                <h2 className="text-lg font-bold text-slate-800">Attendance disputes</h2>
                <p className="text-sm text-slate-400">
                    Review timesheet correction requests before they feed payroll.
                </p>
            </div>
            <DataTable columns={columns} data={disputes} loading={loading} showSearch={false} />
        </div>
    );
}
