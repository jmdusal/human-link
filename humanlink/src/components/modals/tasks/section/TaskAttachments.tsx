import React, { useEffect, useRef, useState } from 'react';
import { Image as ImageIcon, ImagePlus, Paperclip, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Task, TaskAttachment } from '@/types';
import { TaskAttachmentService } from '@/services/TaskAttachmentService';

const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIZE_MB = 5;
const STORAGE_ORIGIN = 'http://localhost:8000';

const resolveAttachmentUrl = (url: string): string => {
    if (!url) return '';
    if (url.startsWith('/')) return `${STORAGE_ORIGIN}${url}`;
    return url.replace(/^http:\/\/localhost(?::\d+)?/, STORAGE_ORIGIN);
};

const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

interface TaskAttachmentsProps {
    task: Task;
    canEdit?: boolean;
    onChange?: (attachments: TaskAttachment[]) => void;
}

export const TaskAttachments: React.FC<TaskAttachmentsProps> = ({
    task,
    canEdit = true,
    onChange,
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [attachments, setAttachments] = useState<TaskAttachment[]>(task.attachments || []);
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<TaskAttachment | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    useEffect(() => {
        let cancelled = false;

        const loadAttachments = async () => {
            try {
                const data = await TaskAttachmentService.list(task.id);
                if (!cancelled) {
                    setAttachments(data);
                    onChange?.(data);
                }
            } catch (error) {
                console.error('Failed to load attachments', error);
                if (!cancelled) setAttachments(task.attachments || []);
            }
        };

        loadAttachments();

        return () => {
            cancelled = true;
        };
    }, [task.id]);

    const updateAttachments = (next: TaskAttachment[]) => {
        setAttachments(next);
        onChange?.(next);
    };

    const handleSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;

        if (!ACCEPTED_TYPES.includes(file.type)) {
            toast.error('Only image files are allowed (jpeg, png, gif, webp)');
            return;
        }

        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            toast.error(`Image must be ${MAX_SIZE_MB}MB or smaller`);
            return;
        }

        setUploading(true);
        try {
            const uploaded = await TaskAttachmentService.upload(task.id, file);
            updateAttachments([uploaded, ...attachments]);
            toast.success('Image attached');
        } catch (error) {
            console.error('Upload failed', error);
            toast.error('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (attachment: TaskAttachment, event: React.MouseEvent) => {
        event.stopPropagation();
        setDeletingId(attachment.id);
        try {
            await TaskAttachmentService.delete(attachment.id);
            updateAttachments(attachments.filter((item) => item.id !== attachment.id));
            if (preview?.id === attachment.id) setPreview(null);
            toast.success('Attachment removed');
        } catch (error) {
            console.error('Delete failed', error);
            toast.error('Failed to remove attachment');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                    <Paperclip size={14} /> Attachments
                </div>
                {canEdit && (
                    <>
                        <input
                            ref={inputRef}
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                            className="hidden"
                            onChange={handleSelect}
                        />
                        <button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            disabled={uploading}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-[11px] font-bold hover:bg-slate-200 disabled:opacity-50 transition-all"
                        >
                            <ImagePlus size={13} />
                            {uploading ? 'Uploading...' : 'Add image'}
                        </button>
                    </>
                )}
            </div>

            {attachments.length === 0 ? (
                <p className="text-[13px] text-slate-400">
                    {canEdit ? 'No images yet. Add an image attachment.' : 'No attachments'}
                </p>
            ) : (
                <ul className="divide-y divide-slate-100 rounded-xl border border-slate-100 overflow-hidden">
                    {attachments.map((attachment) => (
                        <li
                            key={attachment.id}
                            className="group flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 transition-colors"
                        >
                            <button
                                type="button"
                                onClick={() => setPreview(attachment)}
                                className="flex items-center gap-3 min-w-0 flex-1 text-left"
                            >
                                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                                    <ImageIcon size={14} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[13px] font-semibold text-slate-700 truncate group-hover:text-blue-600 transition-colors">
                                        {attachment.fileName}
                                    </p>
                                    <p className="text-[11px] text-slate-400">
                                        {formatFileSize(attachment.fileSize)} · Click to preview
                                    </p>
                                </div>
                            </button>
                            {canEdit && (
                                <button
                                    type="button"
                                    onClick={(e) => handleDelete(attachment, e)}
                                    disabled={deletingId === attachment.id}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            {preview && (
                <div
                    className="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-950/70 p-6"
                    onClick={() => setPreview(null)}
                >
                    <button
                        type="button"
                        onClick={() => setPreview(null)}
                        className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20"
                    >
                        <X size={20} />
                    </button>
                    <div
                        className="max-w-5xl w-full space-y-3"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <p className="text-sm font-medium text-white/90 truncate text-center">
                            {preview.fileName}
                        </p>
                        <img
                            src={resolveAttachmentUrl(preview.url)}
                            alt={preview.fileName}
                            className="max-w-full max-h-[80vh] mx-auto rounded-2xl shadow-2xl object-contain bg-white"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
