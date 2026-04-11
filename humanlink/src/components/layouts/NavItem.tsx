import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

interface NavItemProps {
    icon?: React.ReactNode;
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
            className={`relative flex items-center gap-4 px-4 py-2.5 rounded-xl cursor-pointer transition-all ${
                isChild && !isCollapsed ? 'ml-9 text-xs' : 'text-sm'
            } ${isCollapsed ? 'justify-center px-0 mx-2' : ''} ${
                isActive ? 'text-blue-600 font-bold' : 'text-slate-600 hover:text-slate-900 font-semibold'
            }`}
        >
            {/* THE ELITE INDICATOR: This slides between items */}
            {isActive && (
                <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-white shadow-sm rounded-xl -z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
            )}

            <span className="shrink-0 relative z-10">{icon}</span>
            {!isCollapsed && <span className="whitespace-nowrap relative z-10">{label}</span>}
        </NavLink>
    );
};
