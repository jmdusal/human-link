import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    pdfUrl: string | null;
    loading?: boolean;
    /** Defaults to pdf. Use image for PNG/JPG previews (e.g. employee ID cards). */
    previewKind?: 'pdf' | 'image';
}

export default function ContractTemplatePreviewModal({
    isOpen,
    onClose,
    title,
    subtitle,
    pdfUrl,
    loading = false,
    previewKind = 'pdf',
}: Props) {
    useEffect(() => {
        if (!isOpen) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isOpen]);

    if (!isOpen) return null;

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
                className="relative flex max-h-[min(920px,calc(100dvh-2rem))] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
            >
                <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
                    <div className="min-w-0">
                        <h2 className="truncate text-lg font-bold text-slate-800">{title}</h2>
                        {subtitle && (
                            <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md p-2 text-slate-400 hover:bg-slate-50"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="min-h-0 flex-1 bg-slate-100/80 p-3 sm:p-4">
                    {loading || !pdfUrl ? (
                        <div className="flex h-full min-h-[60vh] items-center justify-center rounded-xl border border-slate-200 bg-white">
                            <div className="flex flex-col items-center gap-3">
                                <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                                <p className="text-xs font-medium text-slate-400">
                                    Loading preview...
                                </p>
                            </div>
                        </div>
                    ) : previewKind === 'image' ? (
                        <div className="flex h-[min(760px,calc(100dvh-10rem))] w-full items-center justify-center overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-6">
                            <img
                                src={pdfUrl}
                                alt={title}
                                className="mx-auto max-h-full max-w-full object-contain shadow-sm"
                            />
                        </div>
                    ) : (
                        <iframe
                            title={title}
                            src={pdfUrl}
                            className="h-[min(760px,calc(100dvh-10rem))] w-full rounded-xl border border-slate-200 bg-white"
                        />
                    )}
                </div>
            </motion.div>
        </div>,
        document.body,
    );
}
