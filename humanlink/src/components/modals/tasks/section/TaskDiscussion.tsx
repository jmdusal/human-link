import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, Pencil, Trash2, Check } from 'lucide-react';
import { TaskCommentService } from '@/services/TaskCommentService';
import { UserService } from '@/services/UserService';
import { getInitials } from '@/utils/userUtils';
import type { Task, TaskComment, User } from '@/types';

interface TaskDiscussionProps {
    task: Task;
    authUser: any;
}

type MentionTarget = 'main' | number | 'edit';

export const TaskDiscussion: React.FC<TaskDiscussionProps> = ({ task, authUser }) => {
    const [comments, setComments] = useState<TaskComment[]>([]);
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [replyText, setReplyText] = useState('');
    const [editText, setEditText] = useState('');

    const [projectMembers, setProjectMembers] = useState<User[]>([]);
    const [activeMentionTarget, setActiveMentionTarget] = useState<MentionTarget | null>(null);
    const [mentionQuery, setMentionQuery] = useState('');
    const [mentionIndex, setMentionIndex] = useState(0);

    const mainInputRef = useRef<HTMLInputElement>(null);
    const replyInputRef = useRef<HTMLInputElement>(null);
    const editInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (task?.comments) {
            const sorted = [...task.comments].sort((a, b) => b.id - a.id);
            setComments(sorted);
        }
    }, [task]);

    useEffect(() => {
        if (!task?.projectId) return;

        let cancelled = false;
        UserService.getUsersByProject(task.projectId)
            .then((members) => {
                if (!cancelled) setProjectMembers(members);
            })
            .catch(() => {
                if (!cancelled) setProjectMembers([]);
            });

        return () => {
            cancelled = true;
        };
    }, [task?.projectId]);

    const filteredMembers = useMemo(() => {
        const query = mentionQuery.toLowerCase();
        return projectMembers.filter((user) =>
            user.name.toLowerCase().includes(query) ||
            user.email?.toLowerCase().includes(query)
        );
    }, [projectMembers, mentionQuery]);

    const closeMentions = useCallback(() => {
        setActiveMentionTarget(null);
        setMentionQuery('');
        setMentionIndex(0);
    }, []);

    const detectMention = (value: string, target: MentionTarget) => {
        const mentionMatch = value.match(/(?:^|\s)@([^\s@]*)$/);
        if (mentionMatch) {
            setActiveMentionTarget(target);
            setMentionQuery(mentionMatch[1]);
            setMentionIndex(0);
        } else {
            closeMentions();
        }
    };

    const insertMention = (user: User) => {
        const target = activeMentionTarget;
        const apply = (prev: string) => prev.replace(/@([^\s@]*)$/, `@${user.name} `);

        if (target === 'edit') {
            setEditText(apply);
        } else {
            setReplyText(apply);
        }

        closeMentions();

        requestAnimationFrame(() => {
            if (target === 'main') mainInputRef.current?.focus();
            else if (target === 'edit') editInputRef.current?.focus();
            else replyInputRef.current?.focus();
        });
    };

    const extractMentionedUserIds = (content: string): number[] => {
        return projectMembers
            .filter((member) => {
                const pattern = new RegExp(`(?:^|\\s)@${member.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:\\s|$)`, 'i');
                return pattern.test(content);
            })
            .map((member) => member.id);
    };

    const handleMainTaskComment = async (parentId: number | null = null) => {
        if (!replyText.trim()) return;
        try {
            const mentionedUserIds = extractMentionedUserIds(replyText);
            const newComment = await TaskCommentService.postTaskComment(
                task.id,
                replyText,
                parentId,
                mentionedUserIds,
            );
            if (parentId) {
                setComments((prev) => prev.map((c) =>
                    c.id === parentId
                        ? { ...c, replies: [newComment, ...(c.replies || [])].sort((a, b) => b.id - a.id) }
                        : c
                ));
            } else {
                setComments((prev) => [newComment, ...prev]);
            }
            setReplyText('');
            setReplyingTo(null);
            closeMentions();
        } catch (error) {
            console.error('Post failed', error);
        }
    };

    const handleSaveEdit = async (id: number) => {
        if (!editText.trim()) return;
        try {
            const updated = await TaskCommentService.updateTaskComment(id, editText);
            setComments((prev) => prev.map((c) => {
                if (c.id === id) return { ...updated, replies: c.replies };
                return { ...c, replies: c.replies?.map((r) => r.id === id ? updated : r) };
            }));
            setEditingId(null);
            closeMentions();
        } catch (error) {
            console.error('Update failed', error);
        }
    };

    const handleDeleteComment = async (id: number) => {
        if (window.confirm('Delete this comment?')) {
            try {
                await TaskCommentService.deleteTaskComment(id);
                setComments((prev) => prev.map((c) => ({
                    ...c,
                    replies: c.replies?.filter((r) => r.id !== id),
                })).filter((c) => c.id !== id));
            } catch (error) {
                console.error('Delete failed', error);
            }
        }
    };

    const handleMentionKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement>,
        onEnter: () => void
    ) => {
        if (activeMentionTarget === null || filteredMembers.length === 0) {
            if (e.key === 'Enter') onEnter();
            return;
        }

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setMentionIndex((i) => (i + 1) % filteredMembers.length);
            return;
        }

        if (e.key === 'ArrowUp') {
            e.preventDefault();
            setMentionIndex((i) => (i - 1 + filteredMembers.length) % filteredMembers.length);
            return;
        }

        if (e.key === 'Enter' || e.key === 'Tab') {
            e.preventDefault();
            insertMention(filteredMembers[mentionIndex]);
            return;
        }

        if (e.key === 'Escape') {
            e.preventDefault();
            closeMentions();
        }
    };

    const renderContentWithMentions = (content: string) => {
        if (!projectMembers.length) return content;

        const escapedNames = projectMembers
            .map((m) => m.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
            .sort((a, b) => b.length - a.length);

        if (!escapedNames.length) return content;

        const pattern = new RegExp(`@(${escapedNames.join('|')})`, 'g');
        const parts: React.ReactNode[] = [];
        let lastIndex = 0;
        let match: RegExpExecArray | null;
        let key = 0;

        while ((match = pattern.exec(content)) !== null) {
            if (match.index > lastIndex) {
                parts.push(content.slice(lastIndex, match.index));
            }

            const mentionedName = match[1];
            const member = projectMembers.find(
                (m) => m.name.toLowerCase() === mentionedName.toLowerCase()
            );

            parts.push(
                <span
                    key={`mention-${key++}`}
                    className="relative inline-flex items-center group/mention cursor-pointer"
                >
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-600 font-semibold text-[12px] hover:bg-blue-100 hover:text-blue-700 transition-colors">
                        @{mentionedName}
                    </span>
                    <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 z-50 opacity-0 group-hover/mention:opacity-100 transition-opacity duration-150">
                        <span className="flex items-center gap-2 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-white shadow-lg">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[8px] font-bold">
                                {getInitials(member?.name || mentionedName)}
                            </span>
                            <span className="flex flex-col leading-tight">
                                <span className="text-[11px] font-semibold">{member?.name || mentionedName}</span>
                                {member?.email && (
                                    <span className="text-[9px] text-slate-300">{member.email}</span>
                                )}
                            </span>
                        </span>
                        <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                    </span>
                </span>
            );
            lastIndex = match.index + match[0].length;
        }

        if (lastIndex < content.length) {
            parts.push(content.slice(lastIndex));
        }

        return parts.length ? parts : content;
    };

    const MentionDropdown = ({ target }: { target: MentionTarget }) => (
        <AnimatePresence>
            {activeMentionTarget === target && (
                <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    className="absolute bottom-full left-0 mb-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] overflow-hidden z-50"
                >
                    <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/80">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            {mentionQuery ? `Matching "${mentionQuery}"` : 'Project members'}
                        </span>
                    </div>
                    <div className="max-h-52 overflow-y-auto custom-scrollbar">
                        {filteredMembers.length === 0 ? (
                            <div className="px-4 py-6 text-center">
                                <p className="text-[13px] font-semibold text-slate-600">No members found</p>
                                <p className="text-[11px] text-slate-400 mt-1">Only project members can be mentioned</p>
                            </div>
                        ) : (
                            filteredMembers.map((user, index) => (
                                <button
                                    key={user.id}
                                    type="button"
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        insertMention(user);
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all ${
                                        index === mentionIndex
                                            ? 'bg-blue-50'
                                            : 'hover:bg-slate-50'
                                    }`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm ${
                                        index === mentionIndex
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-slate-100 text-slate-500'
                                    }`}>
                                        {getInitials(user.name)}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className={`text-[13px] font-bold truncate ${
                                            index === mentionIndex ? 'text-blue-700' : 'text-slate-700'
                                        }`}>
                                            {user.name}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-medium truncate">
                                            {user.email}
                                        </span>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return (
        <div className="flex flex-col h-full max-h-[90vh] relative">
            <div className="flex items-center justify-between px-2 mb-8 shrink-0">
                <div className="flex items-center gap-3">
                    <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">
                        Discussion
                    </h4>
                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {comments.length} Updates
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
                <div className="relative">
                    <div className="absolute left-[20px] top-0 bottom-0 w-[1px] bg-gradient-to-b from-slate-100 via-slate-200 to-slate-100" />

                    <div className="space-y-2">
                        {comments.map((comment) => (
                            <div key={comment.id} className="relative pb-6 last:pb-4">
                                <div className="relative flex gap-6 group">
                                    <div className="relative z-10 shrink-0">
                                        <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[11px] font-bold text-slate-500 ring-4 ring-white transition-all duration-300 group-hover:border-blue-200 group-hover:text-blue-600 shadow-sm">
                                            {getInitials(comment.user.name)}
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0 pt-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[12px] font-bold text-slate-900 tracking-tight">{comment.user.name}</span>
                                                {comment.userId === task.creatorId && (
                                                    <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-[4px] text-[8px] font-black uppercase tracking-tighter">Creator</span>
                                                )}
                                                <span className="text-[11px] font-medium text-slate-300 tabular-nums">
                                                    {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {authUser?.id === comment.userId && (
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => {
                                                                setEditingId(comment.id);
                                                                setEditText(comment.content);
                                                                closeMentions();
                                                            }}
                                                            className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-slate-50 rounded-md transition-all"
                                                        >
                                                            <Pencil size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteComment(comment.id)}
                                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-50 rounded-md transition-all"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                )}
                                                <button
                                                    onClick={() => {
                                                        setReplyingTo(replyingTo === comment.id ? null : comment.id);
                                                        setReplyText('');
                                                        closeMentions();
                                                    }}
                                                    className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all active:scale-95
                                                        ${replyingTo === comment.id
                                                            ? 'bg-slate-900 text-white shadow-md'
                                                            : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                                                >
                                                    {replyingTo === comment.id ? 'Cancel' : 'Reply'}
                                                </button>
                                            </div>
                                        </div>

                                        {editingId === comment.id ? (
                                            <motion.div
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="relative mt-3"
                                            >
                                                <div className="relative flex items-center gap-3">
                                                    <div className="flex-1 relative">
                                                        <MentionDropdown target="edit" />
                                                        <input
                                                            ref={editInputRef}
                                                            type="text"
                                                            autoFocus
                                                            value={editText}
                                                            onChange={(e) => {
                                                                setEditText(e.target.value);
                                                                detectMention(e.target.value, 'edit');
                                                            }}
                                                            onKeyDown={(e) => handleMentionKeyDown(e, () => handleSaveEdit(comment.id))}
                                                            className="w-full bg-blue-50/50 border border-blue-100 rounded-full px-5 py-2.5 text-[13px] text-slate-700 placeholder:text-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-300 transition-all shadow-sm"
                                                        />
                                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                                            <button
                                                                onClick={() => {
                                                                    setEditingId(null);
                                                                    closeMentions();
                                                                }}
                                                                className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors text-[10px] font-bold uppercase tracking-wider px-2"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                onClick={() => handleSaveEdit(comment.id)}
                                                                className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                                                            >
                                                                <Check size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <div className="text-[13px] text-slate-600 leading-relaxed max-w-3xl font-normal group-hover:text-slate-900 transition-colors">
                                                {renderContentWithMentions(comment.content)}
                                            </div>
                                        )}

                                        <AnimatePresence>
                                            {replyingTo === comment.id && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="relative ml-2 pl-8 mt-4 overflow-visible"
                                                >
                                                    <div className="absolute left-0 top-[-24px] bottom-1/2 w-6 border-l border-b border-slate-200 rounded-bl-[12px]" />
                                                    <div className="relative">
                                                        <MentionDropdown target={comment.id} />
                                                        <input
                                                            ref={replyInputRef}
                                                            type="text"
                                                            autoFocus
                                                            placeholder={`Reply to ${comment.user.name}...`}
                                                            value={replyText}
                                                            onChange={(e) => {
                                                                setReplyText(e.target.value);
                                                                detectMention(e.target.value, comment.id);
                                                            }}
                                                            onKeyDown={(e) => handleMentionKeyDown(e, () => handleMainTaskComment(comment.id))}
                                                            className="w-full bg-blue-50/40 border border-blue-100/60 rounded-full px-5 py-2.5 text-[12px] text-slate-700 placeholder:text-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-300 transition-all shadow-sm"
                                                        />
                                                        <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                                                            <button
                                                                onClick={() => handleMainTaskComment(comment.id)}
                                                                className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center"
                                                            >
                                                                <Send size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {comment.replies && comment.replies.length > 0 && (
                                            <div className="mt-6 space-y-6 ml-2 pl-8 border-l border-slate-100">
                                                {[...comment.replies].sort((a, b) => b.id - a.id).map((reply) => (
                                                    <div key={reply.id} className="relative flex gap-4 group/reply">
                                                        <div className="w-7 h-7 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-400 shrink-0">
                                                            {getInitials(reply.user.name)}
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between mb-0.5">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[12px] font-bold text-slate-900">{reply.user.name}</span>
                                                                    <span className="text-[10px] text-slate-300 font-medium">
                                                                        {new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                    </span>
                                                                </div>

                                                                {authUser?.id === reply.userId && (
                                                                    <div className="flex items-center gap-1 opacity-0 group-hover/reply:opacity-100 transition-opacity">
                                                                        <button
                                                                            onClick={() => {
                                                                                setEditingId(reply.id);
                                                                                setEditText(reply.content);
                                                                                closeMentions();
                                                                            }}
                                                                            className="p-1 text-slate-400 hover:text-blue-500 transition-all"
                                                                        >
                                                                            <Pencil size={12} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDeleteComment(reply.id)}
                                                                            className="p-1 text-slate-400 hover:text-red-500 transition-all"
                                                                        >
                                                                            <Trash2 size={12} />
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {editingId === reply.id ? (
                                                                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="relative mt-2">
                                                                    <div className="relative flex items-center gap-2">
                                                                        <MentionDropdown target="edit" />
                                                                        <input
                                                                            ref={editInputRef}
                                                                            type="text"
                                                                            autoFocus
                                                                            value={editText}
                                                                            onChange={(e) => {
                                                                                setEditText(e.target.value);
                                                                                detectMention(e.target.value, 'edit');
                                                                            }}
                                                                            onKeyDown={(e) => handleMentionKeyDown(e, () => handleSaveEdit(reply.id))}
                                                                            className="w-full bg-blue-50/50 border border-blue-100 rounded-full px-4 py-1.5 text-[12px] text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-300 transition-all"
                                                                        />
                                                                        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                                                            <button
                                                                                onClick={() => {
                                                                                    setEditingId(null);
                                                                                    closeMentions();
                                                                                }}
                                                                                className="p-1 text-slate-400 hover:text-slate-600 text-[9px] font-bold uppercase px-2"
                                                                            >
                                                                                Cancel
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleSaveEdit(reply.id)}
                                                                                className="bg-blue-600 text-white p-1.5 rounded-full hover:bg-blue-700 shadow-md transition-all"
                                                                            >
                                                                                <Check size={14} />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </motion.div>
                                                            ) : (
                                                                <div className="text-[12px] text-slate-500 leading-normal">
                                                                    {renderContentWithMentions(reply.content)}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="sticky bottom-0 pt-6 pb-4 bg-gradient-to-t from-white via-white to-transparent shrink-0 z-30">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="relative group">
                        <MentionDropdown target="main" />
                        <input
                            ref={mainInputRef}
                            type="text"
                            value={replyingTo === null ? replyText : ''}
                            onChange={(e) => {
                                if (replyingTo !== null) return;
                                setReplyText(e.target.value);
                                detectMention(e.target.value, 'main');
                            }}
                            onKeyDown={(e) => {
                                if (replyingTo !== null) return;
                                handleMentionKeyDown(e, () => handleMainTaskComment(null));
                            }}
                            disabled={replyingTo !== null}
                            placeholder={replyingTo !== null ? 'Finish your reply above...' : 'Write a message... Use @ to mention'}
                            className={`w-full border rounded-2xl px-6 py-4 text-sm transition-all ${
                                replyingTo !== null
                                    ? 'bg-slate-100 border-slate-200 cursor-not-allowed opacity-50'
                                    : 'bg-blue-50/40 border-blue-100/60 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400/40 text-slate-700 placeholder:text-blue-300 shadow-sm'
                            }`}
                        />

                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            <button type="button" className="p-2 text-blue-400/60 hover:text-blue-600 transition-colors">
                                <Paperclip size={18} />
                            </button>
                            <button
                                type="button"
                                onClick={() => handleMainTaskComment(null)}
                                disabled={!replyText.trim() || replyingTo !== null}
                                className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
