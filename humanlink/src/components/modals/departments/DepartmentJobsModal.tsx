import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Briefcase, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { StatusBadge } from '@/components/shared/TableCells';
import { PositionService } from '@/services/PositionService';
import type { Department, Position } from '@/types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    department: Department | null;
}

export default function DepartmentJobsModal({ isOpen, onClose, department }: Props) {
    const [jobs, setJobs] = useState<Position[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isOpen || !department) {
            setJobs([]);
            return;
        }

        let cancelled = false;

        const load = async () => {
            setLoading(true);
            try {
                const data = await PositionService.getAllPositions({
                    departmentId: department.id,
                });
                if (!cancelled) setJobs(data);
            } catch (error) {
                console.error('Department jobs load error:', error);
                if (!cancelled) setJobs([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();

        return () => {
            cancelled = true;
        };
    }, [isOpen, department]);

    useEffect(() => {
        if (!isOpen) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isOpen]);

    if (!isOpen || !department) return null;

    return createPortal(
        <div className="fixed inset-0 z-[200] flex h-[100dvh] w-screen items-center justify-center overflow-hidden p-3 sm:p-6">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/50"
                onClick={onClose}
            />
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                className="relative flex max-h-[min(720px,calc(100dvh-2rem))] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
            >
                <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
                    <div className="min-w-0">
                        {/* <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <Briefcase size={16} />
                        </div> */}
                        <h2 className="truncate text-lg font-bold text-slate-800">
                            {department.name}
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-400">
                            Jobs under this department
                            {!loading && ` · ${jobs.length} total`}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md p-2 text-slate-400 hover:bg-slate-50"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="min-h-0 flex-1 overflow-auto p-4 sm:p-5">
                    {loading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="h-16 animate-pulse rounded-xl bg-slate-100"
                                />
                            ))}
                        </div>
                    ) : jobs.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-200 px-4 py-12 text-center text-sm font-medium text-slate-400">
                            No jobs in this department yet.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {jobs.map((job) => (
                                <div
                                    key={job.id}
                                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3"
                                >
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-bold text-slate-800">
                                            {job.name}
                                        </p>
                                        <p className="mt-0.5 truncate text-[11px] font-medium text-slate-400">
                                            {job.slug}
                                        </p>
                                    </div>
                                    <StatusBadge status={job.isActive ? 'active' : 'inactive'} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>,
        document.body,
    );
}
