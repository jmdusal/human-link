import { useEffect, useState } from 'react';
import { CheckCircle2, Circle, X } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import { LifecycleService } from '@/services/LifecycleService';
import type { EmployeeChecklist, EmployeeLifecyclePayload, User } from '@/types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    onUserUpdated?: (user: User) => void;
}

function ChecklistBlock({
    title,
    checklist,
    onToggle,
    togglingId,
}: {
    title: string;
    checklist: EmployeeChecklist | null;
    onToggle: (itemId: number) => void;
    togglingId: number | null;
}) {
    if (!checklist) {
        return (
            <div className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-400">
                No {title.toLowerCase()} checklist yet.
            </div>
        );
    }

    const doneCount = checklist.items.filter((item) => item.isDone).length;

    return (
        <div className="rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-bold text-slate-800">{title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                        {doneCount}/{checklist.items.length} complete · {checklist.status.replace('_', ' ')}
                    </p>
                </div>
            </div>
            <ul className="divide-y divide-slate-100">
                {checklist.items.map((item) => (
                    <li key={item.id}>
                        <button
                            type="button"
                            disabled={togglingId === item.id}
                            onClick={() => onToggle(item.id)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors"
                        >
                            {item.isDone ? (
                                <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                            ) : (
                                <Circle size={18} className="text-slate-300 shrink-0" />
                            )}
                            <span className={`text-sm ${item.isDone ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                {item.label}
                            </span>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default function EmployeeLifecycleModal({ isOpen, onClose, user, onUserUpdated }: Props) {
    const [lifecycle, setLifecycle] = useState<EmployeeLifecyclePayload | null>(null);
    const [loading, setLoading] = useState(false);
    const [togglingId, setTogglingId] = useState<number | null>(null);
    const [offboarding, setOffboarding] = useState(false);
    const [terminatedAt, setTerminatedAt] = useState(() => new Date().toISOString().slice(0, 10));
    const [generateFinalPayslip, setGenerateFinalPayslip] = useState(true);
    const [includeLeavePayout, setIncludeLeavePayout] = useState(true);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (!isOpen || !user) return;

        let cancelled = false;
        setLoading(true);

        LifecycleService.get(user.id)
            .then((data) => {
                if (!cancelled) setLifecycle(data);
            })
            .catch((error: any) => {
                toast.error(error?.response?.data?.message || 'Failed to load lifecycle.');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [isOpen, user?.id]);

    if (!isOpen || !user) return null;

    const refreshItem = async (itemId: number) => {
        setTogglingId(itemId);
        try {
            await LifecycleService.toggleItem(user.id, itemId);
            const data = await LifecycleService.get(user.id);
            setLifecycle(data);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to update checklist item.');
        } finally {
            setTogglingId(null);
        }
    };

    const handleOffboard = async () => {
        if (!terminatedAt) {
            toast.error('Termination date is required.');
            return;
        }

        setOffboarding(true);
        try {
            const result = await LifecycleService.offboard(user.id, {
                terminatedAt,
                generateFinalPayslip,
                includeLeavePayout,
                notes: notes || undefined,
            });
            onUserUpdated?.(result.user);
            if (result.checklist) {
                setLifecycle((prev) => ({
                    onboard: prev?.onboard ?? null,
                    offboard: result.checklist,
                }));
            } else {
                const data = await LifecycleService.get(user.id);
                setLifecycle(data);
            }
            toast.success('Employee offboarded. Access revoked.');
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to offboard employee.');
        } finally {
            setOffboarding(false);
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
                className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-xl border border-slate-200 shadow-xl"
            >
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">Onboarding / Offboarding</h2>
                        <p className="text-xs text-slate-400 mt-0.5">{user.name} · {user.email}</p>
                    </div>
                    <button type="button" onClick={onClose} className="p-2 rounded-md text-slate-400 hover:bg-slate-50">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-5 space-y-5">
                    {loading || !lifecycle ? (
                        <p className="text-sm text-slate-400 py-8 text-center">Loading checklists…</p>
                    ) : (
                        <>
                            <ChecklistBlock
                                title="Onboarding"
                                checklist={lifecycle.onboard}
                                onToggle={refreshItem}
                                togglingId={togglingId}
                            />
                            <ChecklistBlock
                                title="Offboarding"
                                checklist={lifecycle.offboard}
                                onToggle={refreshItem}
                                togglingId={togglingId}
                            />

                            {user.status !== 'inactive' && (
                                <div className="rounded-xl border border-rose-100 bg-rose-50/40 p-4 space-y-3">
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-800">Run offboarding</h3>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            Revokes access, deactivates the account, and optionally generates a final payslip with leave payout.
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                                Termination date
                                            </label>
                                            <input
                                                type="date"
                                                value={terminatedAt}
                                                onChange={(event) => setTerminatedAt(event.target.value)}
                                                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                                Notes
                                            </label>
                                            <input
                                                type="text"
                                                value={notes}
                                                onChange={(event) => setNotes(event.target.value)}
                                                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white"
                                                placeholder="Optional"
                                            />
                                        </div>
                                    </div>
                                    <label className="flex items-center gap-2 text-sm text-slate-700">
                                        <input
                                            type="checkbox"
                                            checked={generateFinalPayslip}
                                            onChange={(event) => setGenerateFinalPayslip(event.target.checked)}
                                        />
                                        Generate final payslip
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-slate-700">
                                        <input
                                            type="checkbox"
                                            checked={includeLeavePayout}
                                            onChange={(event) => setIncludeLeavePayout(event.target.checked)}
                                            disabled={!generateFinalPayslip}
                                        />
                                        Include leave payout
                                    </label>
                                    <Button
                                        variant="danger"
                                        loading={offboarding}
                                        onClick={handleOffboard}
                                    >
                                        Offboard employee
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
