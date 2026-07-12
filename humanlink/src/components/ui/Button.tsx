import React from 'react';
import { type LucideIcon, Loader2 } from "lucide-react"; 

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    icon?: LucideIcon;
    variant?: 'ghost' | 'primary' | 'outline' | 'secondary' | 'danger';
    loading?: boolean;
}

export default function Button({icon: Icon, variant = 'primary', children, className = "", loading = false, ...props }: ButtonProps) {
    const baseStyles = "inline-flex items-center gap-2 whitespace-nowrap transition-all duration-200 active:scale-[0.98] cursor-pointer font-medium text-sm";
    
    const variants = {
        primary: "bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm border border-blue-700 hover:bg-blue-700 hover:shadow-md",
        secondary: "bg-white text-slate-700 px-4 py-2 rounded-lg border border-slate-200 shadow-sm hover:bg-slate-50 hover:border-slate-300 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-800 dark:hover:border-slate-600",
        ghost: "p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800",
        outline: "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 rounded-lg px-4 py-2 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800",
        danger: "bg-red-600 text-white px-4 py-2 rounded-lg border border-red-700 shadow-sm hover:bg-red-700"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${className}`}
            disabled={loading || props.disabled}
            {...props}
        >
            {/* <Icon size={18} strokeWidth={2.5} /> */}
            {/* {Icon && <Icon size={18} strokeWidth={2.5} />}
            {children} */}
            {loading ? (
                <Loader2 size={18} strokeWidth={2.5} className="animate-spin" />
            ) : (
                Icon && <Icon size={18} strokeWidth={2.5} />
            )}
            
            {children}
        </button>
    );
}