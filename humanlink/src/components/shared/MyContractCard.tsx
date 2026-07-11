import { ExternalLink, FileText } from 'lucide-react';
import type { UserDocument } from '@/types';

const STORAGE_ORIGIN = 'http://localhost:8000';

const resolveUrl = (url: string): string => {
    if (!url) return '';
    if (url.startsWith('/')) return `${STORAGE_ORIGIN}${url}`;
    return url.replace(/^http:\/\/localhost(?::\d+)?/, STORAGE_ORIGIN);
};

const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

interface MyContractCardProps {
    contract?: UserDocument | null;
    loading?: boolean;
    className?: string;
}

export default function MyContractCard({ contract, loading = false, className = '' }: MyContractCardProps) {
    return (
        <div className={`bg-white rounded-[1.75rem] border border-slate-100 shadow-sm p-6 ${className}`}>
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                        <FileText size={18} className="text-blue-600" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-800">My contract</h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Your employment agreement on file.
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-5">
                {loading ? (
                    <p className="text-sm text-slate-400">Loading contract…</p>
                ) : !contract ? (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-5">
                        <p className="text-sm font-medium text-slate-600">No contract uploaded yet</p>
                        <p className="text-xs text-slate-400 mt-1">
                            HR will attach your contract during onboarding.
                        </p>
                    </div>
                ) : (
                    <div className="rounded-xl border border-blue-100 bg-blue-50/40 px-4 py-4 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">
                                {contract.fileName}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                                {formatFileSize(contract.fileSize)}
                                {contract.createdAt
                                    ? ` · ${new Date(contract.createdAt).toLocaleDateString()}`
                                    : ''}
                            </p>
                        </div>
                        <a
                            href={resolveUrl(contract.url)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 shrink-0 px-3 py-2 rounded-xl bg-white border border-blue-100 text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                            View
                            <ExternalLink size={12} />
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
