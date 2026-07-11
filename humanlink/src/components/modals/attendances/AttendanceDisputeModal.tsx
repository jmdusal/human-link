import { useState } from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import type { Attendance } from '@/types';
import { AttendanceDisputeService } from '@/services/AttendanceDisputeService';
import { formatDisplayDate } from '@/utils/dateUtils';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    attendance: Attendance | null;
    onSuccess?: () => void;
}

export default function AttendanceDisputeModal({ isOpen, onClose, attendance, onSuccess }: Props) {
    const [reason, setReason] = useState('');
    const [proposedHours, setProposedHours] = useState('');
    const [proposedOtHours, setProposedOtHours] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen || !attendance) return null;

    const handleSubmit = async () => {
        if (!reason.trim()) {
            toast.error('Please describe the issue.');
            return;
        }

        setLoading(true);
        try {
            await AttendanceDisputeService.create({
                attendanceId: attendance.id,
                reason: reason.trim(),
                proposedTotalMs: proposedHours
                    ? Math.round(Number(proposedHours) * 3_600_000)
                    : null,
                proposedOvertimeMs: proposedOtHours
                    ? Math.round(Number(proposedOtHours) * 3_600_000)
                    : null,
            });
            toast.success('Dispute submitted for review.');
            setReason('');
            setProposedHours('');
            setProposedOtHours('');
            onSuccess?.();
            onClose();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to submit dispute.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                onClick={onClose}
            />
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                className="relative w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-xl"
            >
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">Dispute attendance</h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                            {formatDisplayDate(attendance.date)} · request a correction before payroll
                        </p>
                    </div>
                    <button type="button" onClick={onClose} className="p-2 rounded-md text-slate-400 hover:bg-slate-50">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-5 space-y-4">
                    <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Reason</label>
                        <textarea
                            value={reason}
                            onChange={(event) => setReason(event.target.value)}
                            rows={4}
                            className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            placeholder="What looks wrong with this timesheet day?"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Proposed hours
                            </label>
                            <input
                                type="number"
                                min={0}
                                step="0.25"
                                value={proposedHours}
                                onChange={(event) => setProposedHours(event.target.value)}
                                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                placeholder="Optional"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Proposed OT hours
                            </label>
                            <input
                                type="number"
                                min={0}
                                step="0.25"
                                value={proposedOtHours}
                                onChange={(event) => setProposedOtHours(event.target.value)}
                                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                placeholder="Optional"
                            />
                        </div>
                    </div>
                    <Button variant="primary" loading={loading} onClick={handleSubmit} className="w-full justify-center">
                        Submit dispute
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}
