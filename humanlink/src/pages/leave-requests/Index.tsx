import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { createColumnHelper } from '@tanstack/react-table';
import { Check, Plus, Pencil, Trash2, X, Ban } from 'lucide-react';
import { DataTable } from '@/components/shared/Datatable';
import Button from '@/components/ui/Button';
import LeaveRequestForm from '@/pages/leave-requests/LeaveRequestForm';
import ModalConfirmation from '@/components/modals/ModalConfirmation';
import TableActions from '@/components/shared/TableActions';
import { useAuth } from '@/context/AuthContext';
import type { LeaveRequest } from '@/types/LeaveRequest';
import { LeaveRequestService } from '@/services/LeaveRequestService';
import { useLeaveRequests } from '@/hooks/use-leave-requests';
import { DateCell, StatusBadge, TextCell, UserCell } from '@/components/shared/TableCells';

const columnHelper = createColumnHelper<LeaveRequest>();

export default function LeaveRequestIndex() {
    const { can, user, hasRole } = useAuth();
    const { leaveRequests, setLeaveRequests, loading } = useLeaveRequests(true);

    const [selectedLeaveRequest, setSelectedLeaveRequest] = useState<LeaveRequest | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

    const isManagerView = user?.userType === 'manager'
        || user?.userType === 'hr'
        || hasRole('super-admin')
        || can('users-edit');

    const canRequestLeave = Boolean(user?.userType) && can('leave-requests-create');

    const handleAdd = () => {
        setSelectedLeaveRequest(null);
        setIsFormOpen(true);
    };

    const handleEdit = (request: LeaveRequest) => {
        setSelectedLeaveRequest(request);
        setIsFormOpen(true);
    };

    const handleSuccess = (requestData: LeaveRequest) => {
        if (selectedLeaveRequest) {
            setLeaveRequests((prev) => prev.map((item) => (item.id === requestData.id ? requestData : item)));
        } else {
            setLeaveRequests((prev) => [requestData, ...prev]);
        }
    };

    const handleDeleteClick = (request: LeaveRequest) => {
        setSelectedLeaveRequest(request);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedLeaveRequest) return;
        setIsDeleting(true);

        try {
            await LeaveRequestService.deleteLeaveRequest(selectedLeaveRequest.id);
            setLeaveRequests((prev) => prev.filter((item) => item.id !== selectedLeaveRequest.id));
            toast.success('Leave request removed successfully.');
            setIsDeleteModalOpen(false);
        } catch (err) {
            console.error('Delete Error:', err);
        } finally {
            setIsDeleting(false);
            setSelectedLeaveRequest(null);
        }
    };

    const updateRequestInList = (requestData: LeaveRequest) => {
        setLeaveRequests((prev) => prev.map((item) => (item.id === requestData.id ? requestData : item)));
    };

    const handleApprove = async (request: LeaveRequest) => {
        setActionLoadingId(request.id);
        try {
            const updated = await LeaveRequestService.approveLeaveRequest(request.id);
            updateRequestInList(updated);
            toast.success('Leave request approved.');
        } catch (err) {
            console.error('Approve Error:', err);
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleReject = async (request: LeaveRequest) => {
        setActionLoadingId(request.id);
        try {
            const updated = await LeaveRequestService.rejectLeaveRequest(request.id);
            updateRequestInList(updated);
            toast.success('Leave request rejected.');
        } catch (err) {
            console.error('Reject Error:', err);
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleCancel = async (request: LeaveRequest) => {
        setActionLoadingId(request.id);
        try {
            const updated = await LeaveRequestService.cancelLeaveRequest(request.id);
            updateRequestInList(updated);
            toast.success('Leave request cancelled.');
        } catch (err) {
            console.error('Cancel Error:', err);
        } finally {
            setActionLoadingId(null);
        }
    };

    const columns = useMemo(() => [
        ...(isManagerView ? [
            columnHelper.accessor((row) => row.user?.name ?? '', {
                id: 'employee',
                header: 'Employee',
                cell: (info) => (
                    <UserCell
                        name={info.row.original.user?.name ?? '—'}
                        email={info.row.original.user?.email ?? ''}
                    />
                ),
            }),
        ] : []),
        columnHelper.accessor((row) => row.leavePolicy?.name ?? '', {
            id: 'policy',
            header: 'Type',
            cell: (info) => <TextCell title={info.getValue() || '—'} />,
        }),
        columnHelper.accessor('startDate', {
            header: 'Start',
            cell: (info) => <DateCell date={info.getValue()} dateOnly />,
        }),
        columnHelper.accessor('endDate', {
            header: 'End',
            cell: (info) => <DateCell date={info.getValue()} dateOnly />,
        }),
        columnHelper.accessor('totalDays', {
            header: 'Days',
            cell: (info) => <TextCell title={info.getValue()} />,
        }),
        columnHelper.accessor('status', {
            header: 'Status',
            cell: (info) => <StatusBadge status={info.getValue()} />,
        }),
        columnHelper.display({
            id: 'actions',
            size: 50,
            header: () => <div className="text-right">Actions</div>,
            cell: (info) => {
                const request = info.row.original;
                const isOwner = request.userId === user?.id;
                const canApprove = isManagerView
                    && request.status === 'pending'
                    && request.userId !== user?.id;

                return (
                    <TableActions
                        actions={[
                            {
                                label: 'Approve',
                                icon: Check,
                                onClick: () => handleApprove(request),
                                show: canApprove && can('leave-requests-edit') && actionLoadingId !== request.id,
                            },
                            {
                                label: 'Reject',
                                icon: X,
                                onClick: () => handleReject(request),
                                variant: 'danger',
                                show: canApprove && can('leave-requests-edit') && actionLoadingId !== request.id,
                            },
                            {
                                label: 'Edit',
                                icon: Pencil,
                                onClick: () => handleEdit(request),
                                show: isOwner && request.status === 'pending' && can('leave-requests-edit'),
                            },
                            {
                                label: 'Cancel',
                                icon: Ban,
                                onClick: () => handleCancel(request),
                                show: isOwner
                                    && ['pending', 'approved'].includes(request.status)
                                    && can('leave-requests-edit')
                                    && actionLoadingId !== request.id,
                            },
                            {
                                label: 'Delete',
                                icon: Trash2,
                                onClick: () => handleDeleteClick(request),
                                variant: 'danger',
                                show: isOwner && request.status !== 'approved' && can('leave-requests-delete'),
                            },
                        ]}
                    />
                );
            },
        }),
    ], [isManagerView, can, user?.id, actionLoadingId]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Leave Requests</h1>
                    <p className="text-sm text-slate-400 mt-1">
                        {isManagerView
                            ? 'Review and approve leave requests from your team.'
                            : 'Submit and track your leave requests.'}
                    </p>
                </div>
                {canRequestLeave && (
                    <Button icon={Plus} onClick={handleAdd}>
                        Request Leave
                    </Button>
                )}
            </div>

            <DataTable
                columns={columns}
                data={leaveRequests}
                loading={loading}
            />

            {isFormOpen && (
                <LeaveRequestForm
                    isOpen={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                    onSuccess={handleSuccess}
                    selectedLeaveRequest={selectedLeaveRequest}
                />
            )}

            <ModalConfirmation
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Leave Request"
                message="Are you sure you want to delete this leave request? This action cannot be undone."
                loading={isDeleting}
            />
        </div>
    );
}
