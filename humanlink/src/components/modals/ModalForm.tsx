import { X, Info, Loader2, Save } from 'lucide-react';
import Button from '@/components/Button';

interface ModalFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    title: string;
    description: string;
    children: React.ReactNode;
    loading?: boolean;
    isUpdate?: boolean;
}

export default function ModalForm({ isOpen, onClose, onSubmit, title, description, children, loading, isUpdate }: ModalFormProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 overflow-hidden bg-slate-900/60 backdrop-blur-md">
            {/* Clickable Backdrop */}
            <div className="fixed inset-0" onClick={onClose} />
            
            {/* Modal Container: Set to flex-col and max-height */}
            <div className="relative w-full max-w-3xl bg-white rounded-[2.5rem] md:rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="px-6 py-6 md:px-10 md:py-8 border-b border-slate-50 flex justify-between items-center bg-white shrink-0">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${isUpdate ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                            <Info size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight leading-none">{title}</h2>
                            <p className="text-slate-400 text-[10px] md:text-[11px] font-bold mt-1 uppercase tracking-widest">{description}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl text-slate-300 border-none bg-transparent cursor-pointer transition-colors">
                        <X size={24}/>
                    </button>
                </div>

                {/* 2. Scrollable */}
                <div className="overflow-y-auto flex-1 px-6 py-4 md:px-10 md:py-8 custom-scrollbar">
                    <form id="modal-form" onSubmit={onSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            {children} 
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="px-6 py-6 md:px-10 md:py-8 border-t border-slate-50 bg-white shrink-0 flex justify-end">
                    <Button 
                        variant="primary" 
                        icon={loading ? Loader2 : Save}
                        // className={`px-10 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest ${isUpdate ? 'bg-amber-500 hover:bg-amber-600' : ''} ${loading ? 'animate-pulse' : ''}`}
                        className={`px-10 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest ${loading ? 'animate-pulse' : ''}`}
                        type="submit"
                        form="modal-form"
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : (isUpdate ? 'Save Changes' : 'Submit')}
                    </Button>
                </div>
            </div>
        </div>
    );
}