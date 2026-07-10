import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'section';
    hover?: boolean;
    children: React.ReactNode;
    className?: string;
}

const variants = {
    default: 'p-6 border border-slate-100 rounded-2xl bg-white shadow-sm',
    section: 'p-8 border border-slate-100 rounded-3xl bg-white shadow-sm',
};

export default function Card({
    variant = 'default',
    hover = false,
    children,
    className = '',
    ...props
}: CardProps) {
    return (
        <div
            className={`
                ${variants[variant]}
                ${hover ? 'hover:shadow-md transition-all duration-300' : ''}
                ${className}
            `}
            {...props}
        >
            {children}
        </div>
    );
}
