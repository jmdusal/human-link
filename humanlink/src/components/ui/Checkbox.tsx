import React from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    sublabel?: string;
}

export default function Checkbox({ label, sublabel, checked, className = "", ...props }: CheckboxProps) {
    return (
        <label className={`flex flex-col items-center justify-center gap-1.5 cursor-pointer group ${className}`}>
            {label && (
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider select-none">
                    {label}
                </span>
            )}

            <div className="relative flex items-center justify-center">
                <input
                    type="checkbox"
                    checked={checked}
                    className="peer appearance-none w-5 h-5 border-2 border-slate-200 rounded-md bg-white 
                               transition-all duration-200 cursor-pointer
                               checked:bg-blue-600 checked:border-blue-600
                               hover:border-slate-300 focus:ring-2 focus:ring-blue-500/20 outline-none"
                    {...props}
                />

                <Check 
                    size={14} 
                    strokeWidth={4} 
                    className="absolute text-white opacity-0 transition-opacity duration-200 
                               peer-checked:opacity-100 pointer-events-none" 
                />
            </div>
            
            {sublabel && (
                <span className="text-[9px] text-slate-400 font-medium lowercase italic">
                    {sublabel}
                </span>
            )}
        </label>
    );
}