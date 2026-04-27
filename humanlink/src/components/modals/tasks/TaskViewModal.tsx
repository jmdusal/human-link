import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, AlignLeft, Tag as TagIcon, Users, Send, Paperclip, Trash2, Pencil } from 'lucide-react';
import type { Task, TaskComment } from '@/types';
import { getInitials } from '@/utils/userUtils';
import { TaskCommentService } from '@/services/TaskCommentService';
import { useAuth } from '@/context/AuthContext';
// import { TaskDiscussion } from '@/section/TaskDiscussion';
import { TaskDiscussion } from '@/components/modals/tasks/section/TaskDiscussion';

interface TaskViewModalProps {
    task: Task | null;
    isOpen: boolean;
    onClose: () => void;
}

export const TaskViewModal: React.FC<TaskViewModalProps> = ({ task, isOpen, onClose }) => {
    const { user: authUser } = useAuth();
    const [shakeTrigger, setShakeTrigger] = useState(0);
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [replyText, setReplyText] = useState("");
    const [comments, setComments] = useState<TaskComment[]>([]);
    
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editText, setEditText] = useState("");

    useEffect(() => {
        if (task?.comments) {
            const sorted = [...task.comments].sort((a, b) => b.id - a.id);
            setComments(sorted);
        }
    }, [task]);
    
    const handleBackdropClick = () => setShakeTrigger(prev => prev + 1);
    
    if (!task) return null;
    
    const priorityStyles = {
        urgent: 'bg-red-500/10 text-red-500',
        high: 'bg-orange-500/10 text-orange-500',
        medium: 'bg-blue-500/10 text-blue-500',
        low: 'bg-slate-500/10 text-slate-500',
    };
    
    const handleMainTaskComment = async (parentId: number | null = null) => {
        if (!replyText.trim()) return;

        try {
            const newComment = await TaskCommentService.postTaskComment(
                task.id, 
                replyText, 
                parentId
            );
            
            if (parentId) {
                setComments(prev => prev.map(c => 
                    c.id === parentId 
                        ? { ...c, replies: [...(c.replies || []), newComment] } 
                        : c
                ));
            } else {
                setComments(prev => [newComment, ...prev]); 
            }

            setReplyText("");
            setReplyingTo(null);
        } catch (error) {
            console.error("Post failed", error);
        }
    };
    
    const handleEditClick = (comment: TaskComment) => {
        if (authUser?.id !== comment.userId) return;
        setEditingId(comment.id);
        setEditText(comment.content);
    };
    
    const handleSaveEdit = async (id: number) => {
        if (!editText.trim()) return;
        try {
            const updated = await TaskCommentService.updateTaskComment(id, editText);
            setComments(prev => prev.map(c => {
                if (c.id === id) return { ...updated, replies: c.replies };
                
                return {
                    ...c,
                    replies: c.replies?.map(r => r.id === id ? updated : r)
                };
            }));
            setEditingId(null);
            setEditText("");
        } catch (error) { 
            console.error("Update failed", error); 
        }
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

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 lg:p-12">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleBackdropClick}
                        className="absolute inset-0 bg-slate-950/40 backdrop-blur-xl"
                    />

                    <motion.div
                        key={shakeTrigger}
                        initial={{ opacity: 0, scale: 0.98, y: 20 }}
                        animate={{ 
                            opacity: 1, scale: 1, y: 0,
                            x: shakeTrigger > 0 ? [0, -5, 5, -5, 5, 0] : 0
                        }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        exit={{ opacity: 0, scale: 0.98, y: 20 }}
                        className="relative w-full max-w-7xl h-fit max-h-[90vh] bg-white rounded-[32px] shadow-[0_32px_128px_-20px_rgba(0,0,0,0.3)] border border-slate-200/60 overflow-hidden flex flex-col"
                    >
                        <div className="px-10 py-5 border-b border-slate-100/80 flex justify-between items-center bg-white/50 backdrop-blur-md">
                            <div className="flex items-center gap-3">
                                <div className="text-[11px] font-bold text-slate-400 tracking-[0.2em] flex items-center gap-2">
                                    <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${priorityStyles[task.priority as keyof typeof priorityStyles]}`}>
                                        {task.priority}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                
                                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-900">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-hidden flex">
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-12 space-y-12">
                                <div className="space-y-6">
                                    <h2 className="text-4xl font-bold text-slate-900 tracking-tight leading-[1.15]">
                                        {task.title}
                                    </h2>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                                            <AlignLeft size={14} /> Description
                                        </div>
                                        <div className="text-slate-600 text-[17px] leading-relaxed max-w-3xl">
                                            {task.description || "Start adding details to this task..."}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="space-y-10 pt-8 border-t border-slate-200/50">
                                    <TaskDiscussion 
                                        task={task}
                                        authUser={authUser}
                                    />
                                </div>
                            </div>
                        

                            <div className="w-80 border-l border-slate-100 bg-slate-50/30 p-10 space-y-10 overflow-y-auto">
                                <div className="space-y-6">
                                    <div className="space-y-2.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Calendar size={12} /> Due Date
                                        </label>
                                        <div className="text-[13px] font-semibold text-slate-900">
                                            April 15, 2026
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Users size={12} /> Assignees
                                        </label>
                                        <div className="space-y-2">
                                            {task.assignees?.map((assignee) => (
                                                <div key={assignee.id} className="flex items-center gap-3 p-1 rounded-lg hover:bg-white transition-all cursor-pointer">
                                                    <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                                                        {getInitials(assignee.name)}
                                                    </div>
                                                    <span className="text-[13px] font-medium text-slate-700">{assignee.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <TagIcon size={12} /> Labels
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {task.tags?.map((tag) => (
                                                <span 
                                                    key={tag.id}
                                                    style={{ backgroundColor: `${tag.color}15`, color: tag.color, borderColor: `${tag.color}30` }}
                                                    className="px-2.5 py-1 border rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm"
                                                >
                                                    {tag.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Paperclip size={12} />Attachments
                                        </label>
                                    </div>
                                </div>

                                <div className="pt-10 border-t border-slate-100 space-y-2">
                                    <div className="flex justify-between text-[11px] font-medium">
                                        <span className="text-slate-400">Created</span>
                                        <span className="text-slate-700">Apr 10, 2026</span>
                                    </div>
                                    <div className="flex justify-between text-[11px] font-medium">
                                        <span className="text-slate-400">Estimate</span>
                                        <span className="text-slate-700">4h 30m</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* <div className="px-10 py-6 bg-white border-t border-blue-100 flex items-center gap-4">
                            <div className="flex-1 relative group">
                                <input 
                                    type="text"
                                    value={replyingTo === null ? replyText : ""} 
                                    onChange={(e) => replyingTo === null && setReplyText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && replyingTo === null && handleMainTaskComment(null)}
                                    disabled={replyingTo !== null}
                                    placeholder={replyingTo !== null ? "Finish your reply above..." : "Write a message..."}
                                    className={`w-full border rounded-2xl px-6 py-3.5 text-sm transition-all ${
                                        replyingTo !== null 
                                        ? 'bg-slate-100 border-slate-200 cursor-not-allowed opacity-50' 
                                        : 'bg-blue-50 border-blue-200/60 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-blue-500/40'
                                    }`}
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                    <button className="p-2 text-blue-400 hover:text-blue-600 transition-colors">
                                        <Paperclip size={18} />
                                    </button>
                                    <button 
                                        onClick={() => handleMainTaskComment(null)}
                                        disabled={!replyText.trim() || replyingTo !== null}
                                        className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Send size={16} />
                                    </button>
                                </div>
                            </div>
                        </div> */}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
