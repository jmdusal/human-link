import React, { useId } from 'react'; // 1. Use useId for unique linking
import FormLabel from '@/components/FormLabel'; 

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    helperText?: string;
    error?: string;
}

export default function FormInput({ label, helperText, error, className, ...props }: FormInputProps) {
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
                <input
                    {...props}
                    id={inputId}
                    aria-invalid={!!error} 
                    aria-describedby={error ? errorId : undefined}
                    className={`
                        w-full px-3 py-2 bg-white border border-slate-200 rounded-md 
                        text-sm text-slate-900 placeholder:text-slate-400
                        hover:border-slate-300
                        focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 
                        shadow-sm outline-none 
                        transition-all duration-150
                        disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
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