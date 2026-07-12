import type { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

interface NavItemProps {
    icon?: ReactNode;
    label: string;
    to: string;
    isChild?: boolean;
    isCollapsed?: boolean;
}

export const NavItem = ({ icon, label, to, isChild = false, isCollapsed = false }: NavItemProps) => {
    const { pathname } = useLocation();
    const isActive = pathname === to || (to !== '/' && pathname.startsWith(to + '/'));

    return (
        <NavLink
            to={to}
            end={to === '/dashboard'}
            title={isCollapsed ? label : undefined}
            className={`group relative flex items-center rounded-lg transition-colors duration-150 ${
                isCollapsed ? 'justify-center px-0 py-2.5' : isChild ? 'gap-3 py-2 pl-10 pr-3' : 'gap-3 px-3 py-2.5'
            } ${
                isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-slate-100'
            }`}
        >
            {isActive && (
                <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 -z-10 rounded-lg bg-blue-50 dark:bg-blue-950/50"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
            )}

            {icon && (
                <span
                    className={`relative z-10 shrink-0 transition-colors duration-150 ${
                        isActive
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'
                    }`}
                >
                    {icon}
                </span>
            )}

            {!isCollapsed && (
                <span
                    className={`relative z-10 truncate text-sm tracking-tight transition-colors duration-150 ${
                        isActive ? 'font-semibold' : 'font-medium'
                    } ${isChild ? 'text-[13px]' : ''}`}
                >
                    {label}
                </span>
            )}

            {isActive && !isCollapsed && (
                <span className="absolute right-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-blue-600 dark:bg-blue-400" />
            )}
        </NavLink>
    );
};
