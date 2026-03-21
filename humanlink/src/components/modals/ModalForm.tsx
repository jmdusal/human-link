import { X, Loader2, Save } from 'lucide-react';
import Button from '@/components/Button';

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
}

export default function ModalForm({ isOpen, onClose, onSubmit, title, description, children, loading, isUpdate, size = '3xl' }: ModalFormProps) {
    if (!isOpen) return null;
    
    const sizeClasses: Record<ModalSize, string> = {
        'sm': 'max-w-sm',
        'md': 'max-w-md',
        'lg': 'max-w-lg',
        'xl': 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl', 
        '4xl': 'max-w-4xl',
        '5xl': 'max-w-5xl',
        'full': 'max-w-[95vw]'
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-200">
            {/* Backdrop */}
            <div className="absolute inset-0" onClick={onClose} />
            
            {/* Modal Body */}
            <div className={`
                relative w-full ${sizeClasses[size]} bg-white rounded-xl shadow-2xl 
                overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-2 
                flex flex-col max-h-[90vh] transition-all duration-300 border border-slate-200
            `}>
                
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
                    <div className="flex flex-col">
                        <h2 className="text-lg font-semibold text-slate-900 leading-tight">
                            {title}
                        </h2>
                        <p className="text-slate-500 text-xs mt-0.5">
                            {description}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-md transition-colors text-slate-400 hover:text-slate-600"
                    >
                        <X size={18} />
                    </button> 
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto flex-1 px-8 py-6 custom-scrollbar bg-white">
                    <form id="modal-form" onSubmit={onSubmit}>
                        <div className="flex flex-col gap-6">
                            {children} 
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0 flex justify-end gap-3">
                    <Button 
                        variant="secondary" 
                        onClick={onClose}
                        type="button"
                        // icon={() => null} 
                        className="px-5 py-2.5 text-sm font-semibold border-none bg-transparent hover:bg-slate-200/50 text-slate-500 hover:text-slate-700"
                    >
                        Cancel
                    </Button>
                    
                    <Button 
                        variant="primary" 
                        icon={loading ? Loader2 : Save}
                        className={`px-6 py-2 text-sm font-medium shadow-sm ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        type="submit"
                        form="modal-form"
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : (isUpdate ? 'Save' : 'Create')}
                    </Button>
                </div>
            </div>
        </div>
    );
}