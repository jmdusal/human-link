import { useEffect, useRef, useState } from 'react';
import { Building2, Check, ChevronDown, Moon, PanelLeftClose, PanelLeftOpen, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '@/api/axios';
import Notification from '@/components/layouts/Notification';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { API_ROUTES } from '@/constants';
import { CompanyService } from '@/services/CompanyService';
import type { Company } from '@/types';
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
    const [companyOpen, setCompanyOpen] = useState(false);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [switching, setSwitching] = useState(false);
    const { user, setUser, can, hasRole, switchCompany } = useAuth();
    const { resolvedTheme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const companyRef = useRef<HTMLDivElement>(null);
    const isPlatformAdmin = hasRole('super-admin');

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
            if (companyRef.current && !companyRef.current.contains(event.target as Node)) {
                setCompanyOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const activeCompanyId = Number(user?.companyId ?? user?.company_id ?? 0) || null;

    useEffect(() => {
        if (!isPlatformAdmin) {
            setCompanies([]);
            return;
        }

        let cancelled = false;

        CompanyService.list()
            .then((list) => {
                if (!cancelled) setCompanies(list);
            })
            .catch(() => {
                if (!cancelled) setCompanies([]);
            });

        return () => {
            cancelled = true;
        };
    }, [isPlatformAdmin, activeCompanyId]);

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

    const handleSwitchCompany = async (company: Company) => {
        if ((activeCompanyId != null && company.id === activeCompanyId) || switching) {
            setCompanyOpen(false);
            return;
        }

        setSwitching(true);
        try {
            await switchCompany(company.id);
            setCompanyOpen(false);
            toast.success(`Switched to ${company.name}`);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to switch company.');
        } finally {
            setSwitching(false);
        }
    };

    return (
        <header className="relative z-50 flex h-14 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl transition-colors duration-200 dark:border-slate-800 dark:bg-slate-950/70 md:px-8">
            <div className="flex items-center">
                {onToggleSidebar && (
                    <button
                        type="button"
                        onClick={onToggleSidebar}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-transparent text-slate-500 transition-all hover:border-slate-200 hover:bg-white hover:text-slate-900 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:bg-slate-900 dark:hover:text-slate-100"
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

            <div className="flex items-center gap-2 sm:gap-3">
                
                {isPlatformAdmin && companies.length > 0 && (
                    <div className="relative" ref={companyRef}>
                        <button
                            type="button"
                            onClick={() => setCompanyOpen((prev) => !prev)}
                            disabled={switching}
                            className={`hidden h-9 items-center gap-2 rounded-xl border px-3 text-sm font-medium transition-all sm:flex ${
                                companyOpen
                                    ? 'border-slate-200 bg-white text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100'
                                    : 'border-slate-200/80 bg-white/70 text-slate-700 hover:border-slate-200 hover:bg-white dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-900'
                            }`}
                        >
                            <Building2 size={15} className="text-slate-500 dark:text-slate-400" />
                            <span className="max-w-[160px] truncate">
                                {user?.company?.name || 'Select company'}
                            </span>
                            <ChevronDown
                                size={14}
                                className={`text-slate-400 transition-transform ${companyOpen ? 'rotate-180' : ''}`}
                            />
                        </button>

                        <AnimatePresence>
                            {companyOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 6 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-slate-200/80 bg-white py-1.5 shadow-lg shadow-slate-200/50 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/40"
                                >
                                    <div className="px-3.5 py-2">
                                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                            Switch company
                                        </p>
                                    </div>
                                    {companies.map((company) => {
                                        const active = activeCompanyId != null && company.id === activeCompanyId;
                                        return (
                                            <button
                                                key={company.id}
                                                type="button"
                                                onClick={() => handleSwitchCompany(company)}
                                                className={`flex w-full items-center gap-2 px-3.5 py-2 text-left text-sm transition-colors ${
                                                    active
                                                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                                                        : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800'
                                                }`}
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <span className="block truncate font-medium">{company.name}</span>
                                                    <span className={`text-[11px] ${active ? 'text-blue-500/80' : 'text-slate-400'}`}>
                                                        {company.slug}
                                                    </span>
                                                </div>
                                                {active && (
                                                    <Check size={16} className="shrink-0 text-blue-600 dark:text-blue-400" />
                                                )}
                                            </button>
                                        );
                                    })}

                                    <div className="my-1.5 h-px bg-slate-100 dark:bg-slate-800" />

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setCompanyOpen(false);
                                            navigate('/company-settings?create=1');
                                        }}
                                        className="w-full px-3.5 py-2 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                                    >
                                        + New company
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setCompanyOpen(false);
                                            navigate('/company-settings');
                                        }}
                                        className="w-full px-3.5 py-2 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                                    >
                                        Company settings
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
                
                <button
                    type="button"
                    onClick={toggleTheme}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-transparent text-slate-500 transition-all hover:border-slate-200 hover:bg-white hover:text-blue-600 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:bg-slate-900 dark:hover:text-blue-400"
                    aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                    title={resolvedTheme === 'dark' ? 'Light mode' : 'Dark mode'}
                >
                    {resolvedTheme === 'dark' ? <Sun size={17} strokeWidth={2.25} /> : <Moon size={17} strokeWidth={2.25} />}
                </button>

                <div className="origin-right scale-90">
                    <Notification />
                </div>

                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className={`flex items-center gap-2.5 rounded-full border p-1 pr-3 transition-all duration-300 ${
                            isOpen
                                ? 'border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900'
                                : 'border-transparent hover:border-slate-200 hover:bg-white dark:hover:border-slate-700 dark:hover:bg-slate-900'
                        }`}
                    >
                        <div className="relative">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-100 bg-blue-50 text-[11px] font-bold uppercase text-blue-700 shadow-inner dark:border-slate-700 dark:bg-blue-950 dark:text-blue-300">
                                {getInitials(user?.name || 'AU')}
                            </div>
                            <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900"></div>
                        </div>

                        <div className="hidden text-left sm:block">
                            <p className="text-[13px] font-bold leading-none tracking-tight text-slate-900 dark:text-slate-100">
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
                                className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200/80 bg-white py-1.5 shadow-lg shadow-slate-200/50 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/40"
                            >
                                <div className="px-3.5 py-2">
                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                        Account
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsOpen(false);
                                        navigate('/my-profile');
                                    }}
                                    className="w-full px-3.5 py-2 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
                                >
                                    My Profile
                                </button>

                                {(isPlatformAdmin || can('companies-view')) && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsOpen(false);
                                            navigate('/company-settings');
                                        }}
                                        className="w-full px-3.5 py-2 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
                                    >
                                        Company Settings
                                    </button>
                                )}

                                <div className="my-1.5 h-px bg-slate-100 dark:bg-slate-800" />

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="w-full px-3.5 py-2 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-950/40"
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
