import React from 'react';

interface FormLabelProps {
    children: React.ReactNode;
    className?: string;
    htmlFor?: string;
}

export default function FormLabel({ children, className = "", htmlFor }: FormLabelProps) {
    return (
        <label 
            htmlFor={htmlFor}
            className={`
                text-[11px] 
                font-semibold 
                text-slate-600 
                uppercase 
                tracking-wider 
                select-none
                ${className}
            `}
        >
            {children}
        </label>
    );
}