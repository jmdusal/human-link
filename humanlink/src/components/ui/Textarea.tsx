import React, { useId } from 'react';
import FormLabel from '@/components/ui/FormLabel';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    helperText?: string;
    error?: string;
}

export default function Textarea({ label, helperText, error, className, ...props }: TextareaProps) {
    const generatedId = useId();
    const inputId = props.id || generatedId;
    const errorId = `${inputId}-error`;

    return (
        <div className="space-y-1.5 text-left group w-full">
            <div className="flex items-center justify-between">
                <FormLabel 
                    htmlFor={inputId}
                    className="text-slate-700 font-medium text-xs uppercase tracking-wider"
                >
                    {label}
                </FormLabel>
                {helperText && !error && (
                    <span className="text-[11px] font-normal text-slate-400">
                        {helperText}
                    </span>
                )}
            </div>
            
            <div className="relative">
                <textarea
                    {...props}
                    id={inputId}
                    className={`
                        w-full px-4 py-3 bg-white border border-slate-200 rounded-md 
                        text-sm leading-relaxed text-slate-900 placeholder:text-slate-400
                        hover:border-slate-300
                        focus:border-black focus:ring-4 focus:ring-slate-100 
                        shadow-[0_1px_2px_rgba(0,0,0,0.05)] outline-none 
                        transition-all duration-200 ease-out
                        disabled:bg-slate-50/50 disabled:text-slate-400 disabled:cursor-not-allowed
                        min-h-[160px] resize-y
                        ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : ''}
                        ${className}
                    `}
                />
            </div>

            {error && (
                <p 
                    id={errorId}
                    className="text-[11px] text-red-500 font-medium mt-1"
                >
                    {error}
                </p>
            )}
        </div>
    );
}
