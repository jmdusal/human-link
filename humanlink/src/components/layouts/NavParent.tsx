import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

interface NavParentProps {
    icon: ReactNode;
    label: string;
    children: ReactNode;
    isCollapsed: boolean;
    items?: Array<{ path: string; label: string; permission?: string }>;
    parentPath?: string;
}

export const NavParent = ({ icon, label, children, isCollapsed, items, parentPath }: NavParentProps) => {
    const { pathname } = useLocation();

    const checkActive = useCallback(() => items?.some((child) => {
        const fullPath = child.path?.startsWith('/')
            ? child.path
            : `${parentPath}/${child.path}`.replace(/\/+/g, '/');
        return pathname === fullPath || pathname.startsWith(fullPath + '/');
    }) || false, [items, pathname, parentPath]);

    const isChildActive = checkActive();
    const [isOpen, setIsOpen] = useState(isChildActive);

    useEffect(() => {
        if (isChildActive) setIsOpen(true);
    }, [isChildActive]);

    if (isCollapsed) {
        return (
            <div
                title={label}
                className={`flex items-center justify-center rounded-lg py-2.5 transition-colors ${
                    isChildActive
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400'
                        : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300'
                }`}
            >
                {icon}
            </div>
        );
    }

    return (
        <div className="space-y-0.5">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors duration-150 ${
                    isChildActive
                        ? 'bg-blue-50/70 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-slate-100'
                }`}
            >
                <div className="flex min-w-0 items-center gap-3">
                    <span
                        className={`shrink-0 transition-colors duration-150 ${
                            isChildActive
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'
                        }`}
                    >
                        {icon}
                    </span>
                    <span className={`truncate text-sm tracking-tight ${isChildActive ? 'font-semibold' : 'font-medium'}`}>
                        {label}
                    </span>
                </div>
                <ChevronDown
                    size={14}
                    className={`shrink-0 text-slate-400 transition-transform duration-200 ease-out ${
                        isOpen ? 'rotate-180' : ''
                    }`}
                />
            </button>

            <div
                className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
            >
                <div className="overflow-hidden">
                    <div className="space-y-0.5 pb-1">{children}</div>
                </div>
            </div>
        </div>
    );
};
