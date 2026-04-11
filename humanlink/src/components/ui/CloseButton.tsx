import { X } from 'lucide-react';

interface CloseButtonProps {
    onClose: () => void;
    className?: string;
}

export default function CloseButton({ onClose, className = "" }: CloseButtonProps) {
    return (
        <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-full text-black hover:bg-slate-100 transition-colors ${className}`}
        >
            <X size={18} strokeWidth={2.5} />
        </button>
    );
}