import { useState, useRef, useEffect } from 'react';
import { ChevronDown, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/api/axios';
import Notification from '@/components/layouts/Notification';
import { useAuth } from '@/context/AuthContext';
import { API_ROUTES } from '@/constants';
import { getInitials } from '@/utils/userUtils';

interface TopHeaderProps {
    isSidebarCollapsed?: boolean;
    onToggleSidebar?: () => void;
}

export default function TopHeader({
    isSidebarCollapsed = false,
    onToggleSidebar,
}: TopHeaderProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { user, setUser } = useAuth();
    const navigate = useNavigate();
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            await api.post(API_ROUTES.AUTH.LOGOUT);
            setUser(null);
            navigate('/login');
        } catch (error) {
            console.error('Logout failed', error);
            setUser(null);
            navigate('/login');
        }
    };

    return (
        <header className="h-14 bg-[#F8FAFC]/40 backdrop-blur-xl border-b border-slate-200/40 flex items-center justify-between px-4 md:px-8 relative z-50">
            <div className="flex items-center">
                {onToggleSidebar && (
                    <button
                        type="button"
                        onClick={onToggleSidebar}
                        className="h-9 w-9 inline-flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200 transition-all"
                        aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {isSidebarCollapsed ? (
                            <PanelLeftOpen size={18} strokeWidth={2.25} />
                        ) : (
                            <PanelLeftClose size={18} strokeWidth={2.25} />
                        )}
                    </button>
                )}
            </div>

            <div className="flex items-center gap-4">
                <div className="scale-90 origin-right">
                    <Notification />
                </div>

                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className={`flex items-center gap-2.5 p-1 pr-3 rounded-full transition-all duration-300 border ${
                            isOpen ? 'bg-white border-slate-200 shadow-sm' : 'border-transparent hover:bg-white hover:border-slate-200'
                        }`}
                    >
                        <div className="relative">
                            <div className="h-8 w-8 rounded-full shadow-inner border border-slate-100 bg-blue-50 text-blue-700 flex items-center justify-center text-[11px] font-bold uppercase">
                                {getInitials(user?.name || 'AU')}
                            </div>
                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                        </div>

                        <div className="text-left hidden sm:block">
                            <p className="text-[13px] font-bold text-slate-900 leading-none tracking-tight">
                                {user?.name || 'Admin User'}
                            </p>
                        </div>
                        <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 6 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-0 mt-2 w-52 bg-white border border-slate-200/80 rounded-xl shadow-lg shadow-slate-200/50 overflow-hidden py-1.5 z-50"
                            >
                                <div className="px-3.5 py-2">
                                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                                        Account
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsOpen(false);
                                        navigate('/my-profile');
                                    }}
                                    className="w-full px-3.5 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                                >
                                    My Profile
                                </button>

                                <button
                                    type="button"
                                    className="w-full px-3.5 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                                >
                                    System Settings
                                </button>

                                <div className="h-px bg-slate-100 my-1.5" />

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="w-full px-3.5 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    Sign Out
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
}
