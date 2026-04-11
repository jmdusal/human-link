import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

interface NavParentProps {
    icon: React.ReactNode;
    label: string;
    children: React.ReactNode;
    isCollapsed: boolean;
    items?: any[];
    parentPath?: string;
}

export const NavParent = ({ icon, label, children, isCollapsed, items, parentPath }: NavParentProps) => {
    const { pathname } = useLocation();

    const checkActive = useCallback(() => items?.some((child: any) => {
        const fullPath = child.path?.startsWith('/')
            ? child.path
            : `${parentPath}/${child.path}`.replace(/\/+/g, '/');
        return pathname === fullPath || pathname.startsWith(fullPath + '/');
    }) || false, [items, pathname, parentPath]);

    const [isOpen, setIsOpen] = useState(checkActive());

    useEffect(() => {
        if (checkActive()) setIsOpen(true);
    }, [pathname, checkActive]);

    if (isCollapsed) {
        return (
            <div className={`flex justify-center py-3 ${checkActive() ? 'text-blue-600' : 'text-slate-400'}`}>
                {icon}
            </div>
        );
    }

    return (
        <div className="space-y-1">
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-between px-4 py-3 rounded-2xl cursor-pointer transition-all group ${
                    checkActive() ? 'bg-blue-50/50 text-blue-600 font-bold' : 'text-slate-500 hover:bg-slate-200/50'
                }`}
            >
                <div className="flex items-center gap-4">
                    <span className={checkActive() ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}>
                        {icon}
                    </span> 
                    <span className="text-sm font-medium">{label}</span>
                </div>
                <ChevronDown 
                    size={16} 
                    className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
                />
            </div>

            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}>
                <div className="pb-2">{children}</div>
            </div>
        </div>
    );
};