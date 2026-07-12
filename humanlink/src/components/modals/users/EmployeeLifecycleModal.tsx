import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Circle, Eye, FileText, Trash2, Upload, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import ModalConfirmation from '@/components/modals/ModalConfirmation';
import ContractTemplatePreviewModal from '@/components/modals/contract-templates/ContractTemplatePreviewModal';
import { LifecycleService } from '@/services/LifecycleService';
import { UserDocumentService } from '@/services/UserDocumentService';
import type {
    EmployeeChecklist,
    EmployeeLifecyclePayload,
    User,
    UserDocument,
    UserDocumentType,
} from '@/types';

type LifecycleConfirmAction = 'offboard' | 'reonboard';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    onUserUpdated?: (user: User) => void;
}

const DOCUMENT_TYPES: { type: UserDocumentType; label: string }[] = [
    { type: 'contract', label: 'Contract' },
    { type: 'id_scan', label: 'Employee ID' },
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
    const [generatingIdCard, setGeneratingIdCard] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [offboarding, setOffboarding] = useState(false);
    const [reonboarding, setReonboarding] = useState(false);
    const [confirmAction, setConfirmAction] = useState<LifecycleConfirmAction | null>(null);
    const [previewDoc, setPreviewDoc] = useState<UserDocument | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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

        if (documents.some((doc) => doc.type === 'contract')) {
            toast.error('Delete the existing contract before generating a new one.');
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
                error?.response?.data?.errors?.contract?.[0] ||
                error?.response?.data?.errors?.employment_type?.[0] ||
                error?.response?.data?.errors?.template_id?.[0] ||
                'Failed to generate contract.';
            toast.error(message);
        } finally {
            setGeneratingContract(false);
        }
    };

    const handleGenerateIdCard = async () => {
        if (documents.some((doc) => doc.type === 'id_scan')) {
            toast.error('Delete the existing employee ID before generating a new one.');
            return;
        }

        setGeneratingIdCard(true);
        try {
            await UserDocumentService.generateIdCard(user.id);
            await refreshLifecycle();
            toast.success('Employee ID generated from template.');
        } catch (error: any) {
            const message =
                error?.response?.data?.message ||
                error?.response?.data?.errors?.id_scan?.[0] ||
                error?.response?.data?.errors?.template_id?.[0] ||
                'Failed to generate employee ID.';
            toast.error(message);
        } finally {
            setGeneratingIdCard(false);
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

    const closeDocumentPreview = () => {
        setPreviewDoc(null);
        setPreviewUrl(null);
    };

    const openDocumentPreview = (doc: UserDocument) => {
        setPreviewDoc(doc);
        setPreviewUrl(resolveUrl(doc.url));
    };

    const canPreviewInModal = (type: UserDocumentType) =>
        type === 'contract' || type === 'id_scan';

    const requestOffboard = () => {
        if (!terminatedAt) {
            toast.error('Termination date is required.');
            return;
        }
        setConfirmAction('offboard');
    };

    const requestReonboard = () => {
        setConfirmAction('reonboard');
    };

    const handleConfirmAction = async () => {
        if (!confirmAction) return;

        if (confirmAction === 'offboard') {
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
                setConfirmAction(null);
                toast.success('Employee offboarded. Access revoked.');
            } catch (error: any) {
                toast.error(error?.response?.data?.message || 'Failed to offboard employee.');
            } finally {
                setOffboarding(false);
            }
            return;
        }

        setReonboarding(true);
        try {
            const result = await LifecycleService.reonboard(user.id);
            onUserUpdated?.(result.user);
            await refreshLifecycle();
            setConfirmAction(null);
            toast.success('Offboarding undone. Access restored. Re-assign workspaces if needed.');
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to undo offboarding.');
        } finally {
            setReonboarding(false);
        }
    };

    const docsByType = (type: UserDocumentType) => documents.filter((doc) => doc.type === type);

    const confirmCopy =
        confirmAction === 'offboard'
            ? {
                  title: 'Offboard employee',
                  message: `Offboard ${user.name}? This sets a termination date, revokes access, and ends employment. Final payslip options you selected will be applied.`,
                  confirmText: 'Offboard',
                  variant: 'danger' as const,
              }
            : {
                  title: 'Undo offboarding',
                  message: `Undo offboarding for ${user.name}? Access will be restored. Workspaces may need to be re-assigned. Any final payslip already created will be kept.`,
                  confirmText: 'Undo offboarding',
                  variant: 'warning' as const,
              };

    return (
        <>
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
                                                        {(type === 'contract' || type === 'id_scan') && (
                                                            <Button
                                                                variant="secondary"
                                                                loading={
                                                                    type === 'contract'
                                                                        ? generatingContract
                                                                        : generatingIdCard
                                                                }
                                                                disabled={files.length > 0}
                                                                title={
                                                                    files.length > 0
                                                                        ? `Delete the existing ${label.toLowerCase()} before generating a new one`
                                                                        : undefined
                                                                }
                                                                onClick={
                                                                    type === 'contract'
                                                                        ? handleGenerateContract
                                                                        : handleGenerateIdCard
                                                                }
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
                                                                {canPreviewInModal(type) ? (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => openDocumentPreview(doc)}
                                                                        className="flex-1 min-w-0 text-left text-xs text-slate-700 truncate hover:underline"
                                                                    >
                                                                        {doc.fileName}
                                                                    </button>
                                                                ) : (
                                                                    <a
                                                                        href={resolveUrl(doc.url)}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        className="flex-1 min-w-0 text-xs text-slate-700 truncate hover:underline"
                                                                    >
                                                                        {doc.fileName}
                                                                    </a>
                                                                )}
                                                                <span className="text-[10px] text-slate-400 shrink-0">
                                                                    {formatFileSize(doc.fileSize)}
                                                                </span>
                                                                {canPreviewInModal(type) && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => openDocumentPreview(doc)}
                                                                        className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                                                                        title="Preview"
                                                                    >
                                                                        <Eye size={14} />
                                                                    </button>
                                                                )}
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
                                        onClick={requestOffboard}
                                    >
                                        Offboard employee
                                    </Button>
                                </div>
                            )}

                            {!!user.terminatedAt && (
                                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-800">Undo offboarding</h3>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            Accidental exit? Restore access and clear the termination date.
                                            Final payslips already generated are kept. Re-assign workspaces if needed.
                                        </p>
                                    </div>
                                    <Button
                                        variant="secondary"
                                        loading={reonboarding}
                                        onClick={requestReonboard}
                                    >
                                        Undo offboarding
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </motion.div>
        </div>

        <AnimatePresence>
            {confirmAction && (
                <ModalConfirmation
                    key={`lifecycle-confirm-${confirmAction}`}
                    isOpen={Boolean(confirmAction)}
                    onClose={() => setConfirmAction(null)}
                    onConfirm={handleConfirmAction}
                    loading={offboarding || reonboarding}
                    title={confirmCopy.title}
                    message={confirmCopy.message}
                    confirmText={confirmCopy.confirmText}
                    variant={confirmCopy.variant}
                />
            )}
        </AnimatePresence>

        <AnimatePresence>
            {previewDoc && (
                <ContractTemplatePreviewModal
                    key={`doc-preview-${previewDoc.id}`}
                    isOpen={Boolean(previewDoc)}
                    onClose={closeDocumentPreview}
                    title={previewDoc.fileName}
                    subtitle={
                        previewDoc.type === 'contract'
                            ? 'Contract preview'
                            : previewDoc.type === 'id_scan'
                              ? 'Employee ID preview'
                              : 'Document preview'
                    }
                    pdfUrl={previewUrl}
                    previewKind={
                        previewDoc.fileType?.startsWith('image/') ||
                        previewDoc.fileName?.toLowerCase().endsWith('.png') ||
                        previewDoc.fileName?.toLowerCase().endsWith('.jpg') ||
                        previewDoc.fileName?.toLowerCase().endsWith('.jpeg') ||
                        previewDoc.fileName?.toLowerCase().endsWith('.webp') ||
                        previewDoc.fileName?.toLowerCase().endsWith('.gif')
                            ? 'image'
                            : 'pdf'
                    }
                />
            )}
        </AnimatePresence>
        </>
    );
}
