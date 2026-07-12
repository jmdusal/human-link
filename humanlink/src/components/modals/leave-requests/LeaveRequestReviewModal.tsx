import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, Loader2, X } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import { StatusBadge } from '@/components/shared/TableCells';
import type { LeaveRequest } from '@/types/LeaveRequest';
import { LeaveRequestService } from '@/services/LeaveRequestService';
import { formatSimpleDate } from '@/utils/dateUtils';
import { useAuth } from '@/context/AuthContext';

interface LeaveConflict {
    id: number;
    user: { id: number; name: string };
    startDate: string;
    endDate: string;
    status: string;
    policy: string | null;
}

interface LeaveRequestReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    leaveRequest: LeaveRequest | null;
    loading?: boolean;
    onUpdated?: (leaveRequest: LeaveRequest) => void;
}

export default function LeaveRequestReviewModal({
    isOpen,
    onClose,
    leaveRequest,
    loading = false,
    onUpdated,
}: LeaveRequestReviewModalProps) {
    const { can, user, hasRole } = useAuth();
    const [actionLoading, setActionLoading] = useState<'approve' | 'reject' | null>(null);
    const [conflicts, setConflicts] = useState<LeaveConflict[]>([]);
    const [conflictsLoading, setConflictsLoading] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (!isOpen || !leaveRequest?.id || leaveRequest.status !== 'pending') {
            setConflicts([]);
            return;
        }

        setConflictsLoading(true);
        LeaveRequestService.conflicts(leaveRequest.id)
            .then(setConflicts)
            .catch(() => setConflicts([]))
            .finally(() => setConflictsLoading(false));
    }, [isOpen, leaveRequest?.id, leaveRequest?.status]);

    if (!isOpen) return null;

    const canReview = (
        user?.accessScope === 'workspace'
        || user?.accessScope === 'company'
        || hasRole('super-admin')
        || can('users-edit')
    ) && can('leave-requests-edit');

    const isPending = leaveRequest?.status === 'pending';
    const showActions = canReview && isPending && leaveRequest?.userId !== user?.id;

    const handleApprove = async () => {
        if (!leaveRequest) return;

        if (conflicts.length > 0) {
            const confirmed = window.confirm(
                `${conflicts.length} overlapping leave(s) exist for these dates. Approve anyway?`,
            );
            if (!confirmed) return;
        }

        setActionLoading('approve');
        try {
            const updated = await LeaveRequestService.approveLeaveRequest(leaveRequest.id);
            toast.success('Leave request approved.');
            onUpdated?.(updated);
            onClose();
        } catch (error) {
            console.error('Approve Error:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async () => {
        if (!leaveRequest) return;
        setActionLoading('reject');
        try {
            const updated = await LeaveRequestService.rejectLeaveRequest(leaveRequest.id);
            toast.success('Leave request rejected.');
            onUpdated?.(updated);
            onClose();
        } catch (error) {
            console.error('Reject Error:', error);
        } finally {
            setActionLoading(null);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[220] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                onClick={onClose}
            />

            <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="relative w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden max-h-[90vh] overflow-y-auto"
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">Leave Request</h2>
                        <p className="text-sm text-slate-400">Review leave details</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-md text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {loading || !leaveRequest ? (
                        <div className="flex items-center justify-center py-10 text-slate-400 gap-2">
                            <Loader2 size={18} className="animate-spin" />
                            Loading leave request...
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Employee</p>
                                    <p className="text-sm font-bold text-slate-800 mt-1">{leaveRequest.user?.name ?? '—'}</p>
                                    <p className="text-xs text-slate-500">{leaveRequest.user?.email ?? ''}</p>
                                </div>
                                <StatusBadge status={leaveRequest.status} />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-lg border border-slate-100 p-3">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Type</p>
                                    <p className="text-sm font-semibold text-slate-800 mt-1">{leaveRequest.leavePolicy?.name ?? '—'}</p>
                                </div>
                                <div className="rounded-lg border border-slate-100 p-3">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Days</p>
                                    <p className="text-sm font-semibold text-slate-800 mt-1">{leaveRequest.totalDays}</p>
                                </div>
                                <div className="rounded-lg border border-slate-100 p-3">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Start</p>
                                    <p className="text-sm font-semibold text-slate-800 mt-1">{formatSimpleDate(leaveRequest.startDate)}</p>
                                </div>
                                <div className="rounded-lg border border-slate-100 p-3">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">End</p>
                                    <p className="text-sm font-semibold text-slate-800 mt-1">{formatSimpleDate(leaveRequest.endDate)}</p>
                                </div>
                            </div>

                            {leaveRequest.reason && (
                                <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Reason</p>
                                    <p className="text-sm text-slate-700 mt-1">{leaveRequest.reason}</p>
                                </div>
                            )}

                            {isPending && (
                                <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-3">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700">
                                        Overlap warnings
                                    </p>
                                    {conflictsLoading ? (
                                        <p className="text-xs text-amber-700 mt-2">Checking overlaps...</p>
                                    ) : conflicts.length === 0 ? (
                                        <p className="text-xs text-amber-700 mt-2">No overlapping leaves found.</p>
                                    ) : (
                                        <ul className="mt-2 space-y-1.5">
                                            {conflicts.map((conflict) => (
                                                <li key={conflict.id} className="text-xs text-amber-800">
                                                    <span className="font-bold">{conflict.user?.name}</span>
                                                    {' · '}
                                                    {formatSimpleDate(conflict.startDate)} – {formatSimpleDate(conflict.endDate)}
                                                    {' · '}
                                                    {conflict.policy ?? conflict.status}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2 sticky bottom-0 bg-white">
                    <Button variant="secondary" onClick={onClose}>
                        Close
                    </Button>
                    {showActions && (
                        <>
                            <Button
                                variant="danger"
                                icon={X}
                                loading={actionLoading === 'reject'}
                                disabled={!!actionLoading}
                                onClick={handleReject}
                            >
                                Reject
                            </Button>
                            <Button
                                icon={Check}
                                loading={actionLoading === 'approve'}
                                disabled={!!actionLoading}
                                onClick={handleApprove}
                            >
                                {conflicts.length > 0 ? 'Approve anyway' : 'Approve'}
                            </Button>
                        </>
                    )}
                </div>
            </motion.div>
        </div>,
        document.body
    );
}
