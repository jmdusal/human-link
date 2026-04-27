import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, Pencil, Trash2, Check } from 'lucide-react';
import { TaskCommentService } from '@/services/TaskCommentService';
import { getInitials } from '@/utils/userUtils';
import type { Task, TaskComment } from '@/types';

interface TaskDiscussionProps {
    task: Task;
    authUser: any;
}

export const TaskDiscussion: React.FC<TaskDiscussionProps> = ({ task, authUser }) => {
    const [comments, setComments] = useState<TaskComment[]>([]);
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [replyText, setReplyText] = useState("");
    const [editText, setEditText] = useState("");
    
    const [showMentions, setShowMentions] = useState(false);
    const [mentionQuery, setMentionQuery] = useState("");
    const [activeMentionId, setActiveMentionId] = useState<number | string | null>(null);
    
    const mentionData = useMemo(() => 
        task.assignees?.map(user => ({
            // id: user.id,
            id: user.id.toString(),
            display: user.name,
        })) || [], 
    [task.assignees]);

    useEffect(() => {
        if (task?.comments) {
            const sorted = [...task.comments].sort((a, b) => b.id - a.id);
            setComments(sorted);
        }
    }, [task]);

    const handleMainTaskComment = async (parentId: number | null = null) => {
        if (!replyText.trim()) return;
        try {
            const newComment = await TaskCommentService.postTaskComment(task.id, replyText, parentId);
            if (parentId) {
                setComments(prev => prev.map(c => 
                    c.id === parentId 
                        ? { ...c, replies: [newComment, ...(c.replies || [])].sort((a, b) => b.id - a.id) } 
                        : c
                ));
            } else {
                setComments(prev => [newComment, ...prev]);
            }
            setReplyText("");
            setReplyingTo(null);
        } catch (error) { console.error("Post failed", error); }
    };

    const handleSaveEdit = async (id: number) => {
        if (!editText.trim()) return;
        try {
            const updated = await TaskCommentService.updateTaskComment(id, editText);
            setComments(prev => prev.map(c => {
                if (c.id === id) return { ...updated, replies: c.replies };
                return { ...c, replies: c.replies?.map(r => r.id === id ? updated : r) };
            }));
            setEditingId(null);
        } catch (error) { console.error("Update failed", error); }
    };

    const handleDeleteComment = async (id: number) => {
        if (window.confirm("Delete this comment?")) {
            try {
                await TaskCommentService.deleteTaskComment(id);
                setComments(prev => prev.map(c => ({
                    ...c,
                    replies: c.replies?.filter(r => r.id !== id)
                })).filter(c => c.id !== id));
            } catch (error) { console.error("Delete failed", error); }
        }
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, id: number | string | null) => {
        const value = e.target.value;
        setReplyText(value);
        
        const mentionMatch = value.match(/@(\w*)$/);
        if (mentionMatch) {
            setActiveMentionId(id);
            setMentionQuery(mentionMatch[1].toLowerCase());
        } else {
            setActiveMentionId(null);
        }
    };

    const filteredAssignees = task.assignees?.filter(user => 
        user.name.toLowerCase().includes(mentionQuery)
    ) || [];

    const insertMention = (name: string) => {
        setReplyText(prev => prev.replace(/@$/, `@${name} `));
        setShowMentions(false);
    };
    
    const mentionsInputStyle = {
        control: {
            fontSize: 14,
            fontWeight: 400,
            lineHeight: '20px',
        },
        '&multiLine': {
            control: {
                fontFamily: 'inherit',
                minHeight: 54,
            },
            highlighter: {
                padding: '16px 24px',
                border: '1px solid transparent',
            },
            input: {
                padding: '16px 24px',
                border: 'none',
                outline: 'none',
            },
        },
        suggestions: {
            list: { 
                backgroundColor: 'white', 
                border: '1px solid #e2e8f0', 
                borderRadius: '12px', 
                fontSize: 12, 
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', 
                overflow: 'hidden', 
                zIndex: 50 
            },
            item: { 
                padding: '8px 12px', 
                borderBottom: '1px solid #f1f5f9', 
                '&focused': { backgroundColor: '#eff6ff', color: '#2563eb' } 
            }
        }
    };

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
                                {/* Main Comment */}
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
                                                            }}
                                                            className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-slate-50 rounded-md transition-all">
                                                            <Pencil size={14} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteComment(comment.id)} 
                                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-50 rounded-md transition-all">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                )}
                                                <button
                                                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
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
                                                className="relative mt-3 group/edit"
                                            >
                                                <div className="absolute left-[-30px] top-[-10px] bottom-1/2 w-8 border-l border-b border-blue-100 rounded-bl-[16px]" />
                                                
                                                <div className="relative flex items-center gap-3">
                                                    <div className="flex-1 relative">
                                                        <input 
                                                            type="text" 
                                                            autoFocus 
                                                            value={editText} 
                                                            onChange={(e) => setEditText(e.target.value)} 
                                                            onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(comment.id)}
                                                            className="w-full bg-blue-50/50 border border-blue-100 rounded-full px-5 py-2.5 text-[13px] text-slate-700 placeholder:text-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-300 transition-all shadow-sm" 
                                                        />
                                                        
                                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                                            <button 
                                                                onClick={() => setEditingId(null)}
                                                                className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors text-[10px] font-bold uppercase tracking-wider px-2"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button 
                                                                onClick={() => handleSaveEdit(comment.id)}
                                                                className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                                                            >
                                                                <Check size={14} />
                                                                {/* <Check size={14} strokeWidth={3} /> */}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <div className="text-[13px] text-slate-600 leading-relaxed max-w-3xl font-normal group-hover:text-slate-900 transition-colors">
                                                {comment.content}
                                            </div>
                                        )}

                                        {/* thread replies Input */}
                                        <AnimatePresence>
                                            {replyingTo === comment.id && (
                                                <motion.div 
                                                    initial={{ opacity: 0, height: 0 }} 
                                                    animate={{ opacity: 1, height: 'auto' }} 
                                                    exit={{ opacity: 0, height: 0 }} 
                                                    className="relative ml-2 pl-8 mt-4 overflow-hidden"
                                                >
                                                    <div className="absolute left-0 top-[-24px] bottom-1/2 w-6 border-l border-b border-slate-200 rounded-bl-[12px]" />
                                                    
                                                    <div className="relative group/reply-input">
                                                        <input 
                                                            type="text" 
                                                            autoFocus 
                                                            placeholder={`Reply to ${comment.user.name}...`} 
                                                            value={replyText} 
                                                            onChange={(e) => setReplyText(e.target.value)}
                                                            onKeyDown={(e) => e.key === 'Enter' && handleMainTaskComment(comment.id)}
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

                                        {/* Replies List */}
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
                                                                        <input 
                                                                            type="text" 
                                                                            autoFocus 
                                                                            value={editText} 
                                                                            onChange={(e) => setEditText(e.target.value)} 
                                                                            onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(reply.id)}
                                                                            className="w-full bg-blue-50/50 border border-blue-100 rounded-full px-4 py-1.5 text-[12px] text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-300 transition-all" 
                                                                        />
                                                                        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                                                            <button onClick={() => setEditingId(null)} className="p-1 text-slate-400 hover:text-slate-600 text-[9px] font-bold uppercase px-2">
                                                                                Cancel
                                                                            </button>
                                                                            <button 
                                                                                onClick={() => handleSaveEdit(reply.id)}
                                                                                className="bg-blue-600 text-white p-1.5 rounded-full hover:bg-blue-700 shadow-md transition-all"
                                                                            >
                                                                                <Check size={14}/>
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </motion.div>
                                                            ) : (
                                                                <div className="text-[12px] text-slate-500 leading-normal">{reply.content}</div>
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
            
            {/* #TODO: mentions in the main message */}
            <div className="sticky bottom-0 pt-6 pb-4 bg-gradient-to-t from-white via-white to-transparent shrink-0 z-30">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="relative group">
                        <input 
                            type="text" 
                            value={replyingTo === null ? replyText : ""}
                            onChange={(e) => setReplyText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && replyingTo === null && handleMainTaskComment(null)}
                            disabled={replyingTo !== null}
                            placeholder={replyingTo !== null ? "Finish your reply above..." : "Write a message..."}
                            className={`w-full border rounded-2xl px-6 py-4 text-sm transition-all ${
                                replyingTo !== null 
                                ? 'bg-slate-100 border-slate-200 cursor-not-allowed opacity-50' 
                                : 'bg-blue-50/40 border-blue-100/60 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400/40 text-slate-700 placeholder:text-blue-300 shadow-sm'
                            }`}
                        />
                        
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            <button className="p-2 text-blue-400/60 hover:text-blue-600 transition-colors">
                                <Paperclip size={18} />
                            </button>
                            <button
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
            
            {/* <div className="sticky bottom-0 pt-6 pb-4 bg-gradient-to-t from-white via-white to-transparent shrink-0 z-30">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="relative group">
                        <AnimatePresence>
                            {activeMentionId === 'main' && filteredAssignees.length > 0 && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute bottom-full left-0 mb-3 w-64 bg-white border border-slate-200 rounded-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden z-50"
                                >
                                    <div className="p-3 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                            {mentionQuery ? `Matching "${mentionQuery}"` : "Assignees"}
                                        </span>
                                    </div>
                                    <div className="max-h-48 overflow-y-auto custom-scrollbar">
                                        {filteredAssignees.map((user) => (
                                            <button
                                                key={user.id}
                                                onClick={() => insertMention(user.name)} // Uses the updated insertMention logic
                                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-all text-left group/item"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 group-hover/item:bg-blue-600 group-hover/item:text-white transition-all shadow-sm">
                                                    {getInitials(user.name)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[13px] font-bold text-slate-700 group-hover/item:text-blue-700">{user.name}</span>
                                                    <span className="text-[10px] text-slate-400 font-medium lowercase">@{user.name.replace(/\s/g, '').toLowerCase()}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <input 
                            type="text" 
                            value={replyingTo === null ? replyText : ""} 
                            onChange={(e) => handleInputChange(e, 'main')} 
                            onKeyDown={(e) => e.key === 'Enter' && replyingTo === null && handleMainTaskComment(null)}
                            disabled={replyingTo !== null}
                            placeholder={replyingTo !== null ? "Finish your reply above..." : "Write a message..."}
                            className={`w-full border rounded-2xl px-6 py-4 text-sm transition-all ${
                                replyingTo !== null 
                                ? 'bg-slate-100 border-slate-200 cursor-not-allowed opacity-50' 
                                : 'bg-blue-50/40 border-blue-100/60 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400/40 text-slate-700 placeholder:text-blue-300 shadow-sm'
                            }`}
                        />
                        
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            <button className="p-2 text-blue-400/60 hover:text-blue-600 transition-colors">
                                <Paperclip size={18} />
                            </button>
                            <button
                                onClick={() => handleMainTaskComment(null)}
                                disabled={!replyText.trim() || replyingTo !== null}
                                className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div> */}

        </div>
    );
};
