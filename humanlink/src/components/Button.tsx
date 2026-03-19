import React from 'react';
import { Plus, type LucideIcon } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    icon?: LucideIcon;
    variant?: 'ghost' | 'primary';
}

// const Button = ({ 
//   icon: Icon = Plus, 
//   variant = 'primary', 
//   children, 
//   className = "", 
//   ...props 
// }: ButtonProps) => {

export default function Button({icon: Icon = Plus, variant = 'primary', children, className = "", ...props }: ButtonProps) {
    // const baseStyles = "flex items-center gap-2 transition-all";
    const baseStyles = "flex items-center gap-2 transition-all duration-200 active:scale-95 hover:scale-105 cursor-pointer";
    
    const variants = {
        ghost: "p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-lg",
        // primary: "bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-slate-200 hover:bg-blue-600"
        primary: "bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-slate-200"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${className}`}
            {...props}
        >
            <Icon size={variant === 'ghost' ? 20 : 18} />
            {children}
        </button>
    );
};