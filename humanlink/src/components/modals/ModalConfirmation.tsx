import { Trash2 } from 'lucide-react';

interface ModalConfirmationProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    loading?: boolean;
}

export default function ModalConfirmation({ 
    isOpen, onClose, onConfirm, title, message, loading 
}: ModalConfirmationProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" 
                onClick={onClose} 
            />
            
            {/* Modal Content */}
            <div className="relative bg-white w-full max-w-sm rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-slate-100 p-6 animate-in zoom-in-95 duration-200">
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="h-16 w-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 shadow-inner">
                        <Trash2 size={32} />
                    </div>
                    
                    <div>
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">{title}</h3>
                        <p className="text-sm text-slate-500 font-medium mt-1 leading-relaxed">
                            {message}
                        </p>
                    </div>

                    <div className="flex w-full gap-3 mt-2">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 px-4 py-3 rounded-2xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition-all border-none cursor-pointer disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={loading}
                            className="flex-1 px-4 py-3 rounded-2xl bg-red-500 text-white text-xs font-bold hover:bg-red-600 shadow-lg shadow-red-200 transition-all border-none cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {loading ? (
                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : "Confirm Delete"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}