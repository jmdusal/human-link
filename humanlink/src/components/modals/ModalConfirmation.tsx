import { X, Loader2, AlertTriangle, Info, Trash2 } from 'lucide-react';
import Button from '@/components/Button';

type ConfirmationVariant = 'danger' | 'warning' | 'info';

interface ModalConfirmationProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    loading?: boolean;
    confirmText?: string;
    variant?: ConfirmationVariant;
}

export default function ModalConfirmation({ isOpen, onClose, onConfirm, title, message, loading,confirmText,variant = 'danger' 
}: ModalConfirmationProps) {
    if (!isOpen) return null;

    const variantConfig = {
        danger: { 
            icon: Trash2, 
            iconColor: 'text-red-600 bg-red-50 border-red-100', 
            btnVariant: 'danger' as const 
        },
        warning: { 
            icon: AlertTriangle, 
            iconColor: 'text-amber-600 bg-amber-50 border-amber-100', 
            btnVariant: 'primary' as const
        },
        info: { 
            icon: Info, 
            iconColor: 'text-blue-600 bg-blue-50 border-blue-100', 
            btnVariant: 'primary' as const 
        },
    };

    const { icon: Icon, iconColor, btnVariant } = variantConfig[variant];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-200">
            <div className="absolute inset-0" onClick={onClose} />
            <div className="relative w-full max-w-sm bg-white rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-2 border border-slate-200">
                <button
                    onClick={onClose}
                    className="absolute right-3 top-3 p-1.5 hover:bg-slate-100 rounded-md transition-colors text-slate-400 hover:text-slate-600 z-10"
                >
                    <X size={16} />
                </button>

                <div className="p-6">
                    <div className="flex flex-col items-center text-center">
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center border ${iconColor} mb-4`}>
                            <Icon size={24} />
                        </div>
                        
                        <h3 className="text-lg font-semibold text-slate-900 leading-tight">
                            {title}
                        </h3>
                        <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                            {message}
                        </p>
                    </div>

                    <div className="flex w-full gap-3 mt-8">
                        <Button
                            variant="secondary"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 justify-center py-2.5"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant={btnVariant}
                            onClick={onConfirm}
                            disabled={loading}
                            icon={loading ? Loader2 : undefined}
                            className={`flex-1 justify-center py-2.5 ${loading ? 'opacity-70' : ''}`}
                        >
                            {loading ? 'Processing...' : (confirmText || (variant === 'danger' ? 'Delete' : 'Confirm'))}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}