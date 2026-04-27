import { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion'; // Import motion
import Button from '@/components/ui/Button';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full';

interface ModalFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    title: string;
    description: string;
    children: React.ReactNode;
    loading?: boolean;
    isUpdate?: boolean;
    size?: ModalSize;
    showFooter?: boolean;
}

export default function ModalForm({ isOpen, onClose, onSubmit, title, description, children, loading, isUpdate, size = '3xl', showFooter = true }: ModalFormProps) {
    if (!isOpen) return null;

    const sizeClasses: Record<ModalSize, string> = {
        'sm': 'max-w-sm', 'md': 'max-w-md', 'lg': 'max-w-lg', 'xl': 'max-w-xl',
        '2xl': 'max-w-2xl', '3xl': 'max-w-3xl', '4xl': 'max-w-4xl', '5xl': 'max-w-5xl',
        'full': 'max-w-[95vw]'
    };
    
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 overflow-hidden">
            {/* BACKDROP: Fades in/out */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-950/20 backdrop-blur-md"
            />

            {/* MODAL BODY: Springs up and Scales */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ 
                    opacity: 1, 
                    scale: 1, 
                    y: 0,
                    transition: { type: "spring", duration: 0.5, bounce: 0.3 } 
                }}
                exit={{ 
                    opacity: 0, 
                    scale: 0.98, 
                    y: 10,
                    transition: { duration: 0.2, ease: "easeIn" } 
                }}
                className={`
                    relative w-full ${sizeClasses[size]} bg-white rounded-3xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] 
                    flex flex-col max-h-[90vh] border border-slate-200/60 overflow-hidden
                `}
            >
                {/* Header */}
                <div className="px-10 py-8 flex justify-between items-start bg-white shrink-0">
                    <div className="space-y-1.5">
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                            {title}
                        </h2>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600/80">
                            {description}
                        </p>
                    </div>

                    <button 
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-900 transition-all border border-transparent hover:border-slate-100"
                    >
                        <X size={20} strokeWidth={2.5} />
                    </button>
                </div>

                {/* Content Area */}
                <div className="overflow-y-auto flex-1 px-10 pb-10 custom-scrollbar">
                    <form id="modal-form" onSubmit={onSubmit} className="space-y-6">
                        {children} 
                    </form>
                </div>

                {showFooter && (
                    <div className="px-10 py-6 border-t border-slate-100 bg-slate-50/50 shrink-0 flex justify-end items-center gap-3">
                        <button 
                            onClick={onClose}
                            type="button"
                            className="px-5 py-2.5 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            Cancel
                        </button>
                        
                        <Button
                            variant="primary"
                            loading={loading}
                            // className="px-8 py-2.5 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-950/20 transition-all active:scale-95"
                            type="submit"
                            form="modal-form"
                            disabled={loading}
                        >
                            {loading ? (isUpdate ? 'Updating...' : 'Creating...') : (isUpdate ? 'Save Changes' : 'Create')}
                        </Button>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
