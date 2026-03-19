import React from 'react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    helperText?: string;
}

export default function FormInput({ label, helperText, className, ...props }: FormInputProps) {
    return (
        <div className="space-y-1.5 text-left group">
            <div className="flex items-baseline justify-between">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest transition-colors group-focus-within:text-blue-500">
                    {label}
                </label>
                {helperText && (
                    <span className="text-[9px] font-medium text-slate-300 lowercase italic">
                        {helperText}
                    </span>
                )}
            </div>
            
            <input
                {...props}
                className={`
                    w-full px-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-xl 
                    text-sm text-slate-600 placeholder:text-slate-300
                    hover:border-slate-200 focus:bg-white focus:border-blue-400 
                    focus:ring-4 focus:ring-blue-500/5 outline-none 
                    transition-all duration-200
                    disabled:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60
                    ${className}
                `}
            />
        </div>
    );
}