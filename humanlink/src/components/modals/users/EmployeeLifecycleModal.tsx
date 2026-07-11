import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Circle, FileText, Trash2, Upload, X } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import { LifecycleService } from '@/services/LifecycleService';
import { UserDocumentService } from '@/services/UserDocumentService';
import type {
    EmployeeChecklist,
    EmployeeLifecyclePayload,
    User,
    UserDocument,
    UserDocumentType,
} from '@/types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    onUserUpdated?: (user: User) => void;
}

const DOCUMENT_TYPES: { type: UserDocumentType; label: string }[] = [
    { type: 'contract', label: 'Contract' },
    { type: 'id_scan', label: 'ID scan' },
    { type: 'signed_policy', label: 'Signed policy' },
];

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

function ChecklistBlock({
    title,
    checklist,
    softKeys,
    onToggle,
    togglingId,
}: {
    title: string;
    checklist: EmployeeChecklist | null;
    softKeys: string[];
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
                            <span className="flex-1 min-w-0">
                                <span className={`block text-sm ${item.isDone ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                    {item.label}
                                </span>
                                {softKeys.includes(item.key) && (
                                    <span className="block text-[10px] text-slate-400 mt-0.5">
                                        Soft — can check off without a file
                                    </span>
                                )}
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
    const [documents, setDocuments] = useState<UserDocument[]>([]);
    const [loading, setLoading] = useState(false);
    const [togglingId, setTogglingId] = useState<number | null>(null);
    const [uploadingType, setUploadingType] = useState<UserDocumentType | null>(null);
    const [generatingContract, setGeneratingContract] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [offboarding, setOffboarding] = useState(false);
    const [terminatedAt, setTerminatedAt] = useState(() => new Date().toISOString().slice(0, 10));
    const [generateFinalPayslip, setGenerateFinalPayslip] = useState(true);
    const [includeLeavePayout, setIncludeLeavePayout] = useState(true);
    const [notes, setNotes] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const pendingTypeRef = useRef<UserDocumentType | null>(null);

    useEffect(() => {
        if (!isOpen || !user) return;

        let cancelled = false;
        setLoading(true);

        LifecycleService.get(user.id)
            .then((data) => {
                if (!cancelled) {
                    setLifecycle(data);
                    setDocuments(data.documents ?? []);
                }
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

    const softKeys = lifecycle?.softDocumentKeys ?? [
        'upload_contract',
        'upload_id_scan',
        'sign_policies',
        'archive_documents',
    ];

    const refreshLifecycle = async () => {
        const data = await LifecycleService.get(user.id);
        setLifecycle(data);
        setDocuments(data.documents ?? []);
    };

    const refreshItem = async (itemId: number) => {
        setTogglingId(itemId);
        try {
            await LifecycleService.toggleItem(user.id, itemId);
            await refreshLifecycle();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to update checklist item.');
        } finally {
            setTogglingId(null);
        }
    };

    const openFilePicker = (type: UserDocumentType) => {
        pendingTypeRef.current = type;
        fileInputRef.current?.click();
    };

    const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        const type = pendingTypeRef.current;
        event.target.value = '';
        pendingTypeRef.current = null;

        if (!file || !type) return;

        const allowed = [
            'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf',
        ];
        if (!allowed.includes(file.type)) {
            toast.error('Only images or PDF files are allowed.');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            toast.error('File must be 10MB or smaller.');
            return;
        }

        setUploadingType(type);
        try {
            await UserDocumentService.upload(user.id, type, file);
            await refreshLifecycle();
            toast.success('Document uploaded.');
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to upload document.');
        } finally {
            setUploadingType(null);
        }
    };

    const handleGenerateContract = async () => {
        if (!user.details?.employmentType) {
            toast.error('Set the employee employment type before generating a contract.');
            return;
        }

        setGeneratingContract(true);
        try {
            await UserDocumentService.generateContract(user.id);
            await refreshLifecycle();
            toast.success('Contract generated from template.');
        } catch (error: any) {
            const message =
                error?.response?.data?.message ||
                error?.response?.data?.errors?.employment_type?.[0] ||
                error?.response?.data?.errors?.template_id?.[0] ||
                'Failed to generate contract.';
            toast.error(message);
        } finally {
            setGeneratingContract(false);
        }
    };

    const handleDeleteDocument = async (documentId: number) => {
        setDeletingId(documentId);
        try {
            await UserDocumentService.delete(user.id, documentId);
            await refreshLifecycle();
            toast.success('Document removed.');
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to delete document.');
        } finally {
            setDeletingId(null);
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
                    documents: prev?.documents,
                    softDocumentKeys: prev?.softDocumentKeys,
                }));
            } else {
                await refreshLifecycle();
            }
            toast.success('Employee offboarded. Access revoked.');
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to offboard employee.');
        } finally {
            setOffboarding(false);
        }
    };

    const docsByType = (type: UserDocumentType) => documents.filter((doc) => doc.type === type);

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
                className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-white rounded-xl border border-slate-200 shadow-xl"
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">Onboarding / Offboarding</h2>
                        <p className="text-xs text-slate-400 mt-0.5">{user.name} · {user.email}</p>
                    </div>
                    <button type="button" onClick={onClose} className="p-2 rounded-md text-slate-400 hover:bg-slate-50">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {loading || !lifecycle ? (
                        <p className="text-sm text-slate-400 py-8 text-center">Loading checklists…</p>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
                            <div className="rounded-xl border border-slate-200 overflow-hidden">
                                <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                                    <h3 className="text-sm font-bold text-slate-800">Documents</h3>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Contract, ID, and signed policies. Checklist items stay soft without files.
                                    </p>
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {DOCUMENT_TYPES.map(({ type, label }) => {
                                        const files = docsByType(type);
                                        return (
                                            <div key={type} className="px-4 py-3 space-y-2">
                                                <div className="flex items-center justify-between gap-3">
                                                    <span className="text-sm font-medium text-slate-700">{label}</span>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        {type === 'contract' && (
                                                            <Button
                                                                variant="secondary"
                                                                loading={generatingContract}
                                                                onClick={handleGenerateContract}
                                                            >
                                                                Generate
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="secondary"
                                                            icon={Upload}
                                                            loading={uploadingType === type}
                                                            onClick={() => openFilePicker(type)}
                                                        >
                                                            Upload
                                                        </Button>
                                                    </div>
                                                </div>
                                                {files.length === 0 ? (
                                                    <p className="text-xs text-slate-400">No file attached yet.</p>
                                                ) : (
                                                    <ul className="space-y-1.5">
                                                        {files.map((doc) => (
                                                            <li
                                                                key={doc.id}
                                                                className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/60 px-2.5 py-2"
                                                            >
                                                                <FileText size={14} className="text-slate-400 shrink-0" />
                                                                <a
                                                                    href={resolveUrl(doc.url)}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="flex-1 min-w-0 text-xs text-slate-700 truncate hover:underline"
                                                                >
                                                                    {doc.fileName}
                                                                </a>
                                                                <span className="text-[10px] text-slate-400 shrink-0">
                                                                    {formatFileSize(doc.fileSize)}
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    disabled={deletingId === doc.id}
                                                                    onClick={() => handleDeleteDocument(doc.id)}
                                                                    className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
                                    className="hidden"
                                    onChange={handleFileSelected}
                                />
                            </div>

                            <div className="space-y-5">
                            <ChecklistBlock
                                title="Onboarding"
                                checklist={lifecycle.onboard}
                                softKeys={softKeys}
                                onToggle={refreshItem}
                                togglingId={togglingId}
                            />
                            <ChecklistBlock
                                title="Offboarding"
                                checklist={lifecycle.offboard}
                                softKeys={softKeys}
                                onToggle={refreshItem}
                                togglingId={togglingId}
                            />
                            </div>
                            </div>

                            {!user.terminatedAt && (
                                <div className="rounded-xl border border-rose-100 bg-rose-50/40 p-4 space-y-3">
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-800">Run offboarding</h3>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            Ends employment: sets a termination date, revokes access, and optionally generates a final payslip with leave payout. For temporary access suspension, use Deactivate from the users list instead.
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
