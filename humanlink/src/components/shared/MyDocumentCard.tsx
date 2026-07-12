import { ExternalLink, Eye, IdCard, type LucideIcon } from 'lucide-react';
import type { UserDocument } from '@/types';
import Button from '@/components/ui/Button';

const STORAGE_ORIGIN = 'http://localhost:8000';

export const resolveDocumentUrl = (url: string): string => {
    if (!url) return '';
    if (url.startsWith('/')) return `${STORAGE_ORIGIN}${url}`;
    return url.replace(/^http:\/\/localhost(?::\d+)?/, STORAGE_ORIGIN);
};

const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export interface MyDocumentCardProps {
    title: string;
    description: string;
    emptyTitle: string;
    emptyDescription: string;
    document?: UserDocument | null;
    loading?: boolean;
    generating?: boolean;
    canGenerate?: boolean;
    generateLabel?: string;
    onGenerate?: () => void;
    /** When set, View opens via callback (e.g. modal) instead of a new tab. */
    onView?: (document: UserDocument) => void;
    icon?: LucideIcon;
    className?: string;
}

export default function MyDocumentCard({
    title,
    description,
    emptyTitle,
    emptyDescription,
    document,
    loading = false,
    generating = false,
    canGenerate = false,
    generateLabel = 'Generate',
    onGenerate,
    onView,
    icon: Icon = IdCard,
    className = '',
}: MyDocumentCardProps) {
    const viewClassName =
        'inline-flex items-center gap-1.5 shrink-0 px-3 py-2 rounded-xl bg-white border border-blue-100 text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors';

    return (
        <div className={`bg-white rounded-[1.75rem] border border-slate-100 shadow-sm p-6 ${className}`}>
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                        <Icon size={18} className="text-blue-600" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">{description}</p>
                    </div>
                </div>
                {canGenerate && onGenerate && (
                    <Button
                        type="button"
                        variant="primary"
                        loading={generating}
                        disabled={generating}
                        onClick={onGenerate}
                        className="shrink-0 !px-3 !py-2 !text-xs"
                    >
                        {generateLabel}
                    </Button>
                )}
            </div>

            <div className="mt-5">
                {loading ? (
                    <p className="text-sm text-slate-400">Loading…</p>
                ) : !document ? (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-5">
                        <p className="text-sm font-medium text-slate-600">{emptyTitle}</p>
                        <p className="text-xs text-slate-400 mt-1">{emptyDescription}</p>
                    </div>
                ) : (
                    <div className="rounded-xl border border-blue-100 bg-blue-50/40 px-4 py-4 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">
                                {document.fileName}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                                {formatFileSize(document.fileSize)}
                                {document.createdAt
                                    ? ` · ${new Date(document.createdAt).toLocaleDateString()}`
                                    : ''}
                            </p>
                        </div>
                        {onView ? (
                            <button
                                type="button"
                                onClick={() => onView(document)}
                                className={viewClassName}
                            >
                                View
                                <Eye size={12} />
                            </button>
                        ) : (
                            <a
                                href={resolveDocumentUrl(document.url)}
                                target="_blank"
                                rel="noreferrer"
                                className={viewClassName}
                            >
                                View
                                <ExternalLink size={12} />
                            </a>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
