import { useEffect, useRef, useState } from 'react';
import { Building2, ChevronDown, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '@/api/axios';
import Notification from '@/components/layouts/Notification';
import { useAuth } from '@/context/AuthContext';
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
    }, [isPlatformAdmin, user?.company_id]);

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
        if (company.id === user?.company_id || switching) {
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

            <div className="flex items-center gap-3">
                {isPlatformAdmin && companies.length > 0 && (
                    <div className="relative" ref={companyRef}>
                        <button
                            type="button"
                            onClick={() => setCompanyOpen((prev) => !prev)}
                            disabled={switching}
                            className={`hidden sm:flex items-center gap-2 h-9 px-3 rounded-xl border text-sm font-medium transition-all ${
                                companyOpen
                                    ? 'bg-white border-slate-200 shadow-sm text-slate-900'
                                    : 'bg-white/70 border-slate-200/80 text-slate-700 hover:bg-white hover:border-slate-200'
                            }`}
                        >
                            <Building2 size={15} className="text-slate-500" />
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
                                    className="absolute right-0 mt-2 w-64 bg-white border border-slate-200/80 rounded-xl shadow-lg shadow-slate-200/50 overflow-hidden py-1.5 z-50"
                                >
                                    <div className="px-3.5 py-2">
                                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                                            Switch company
                                        </p>
                                    </div>
                                    {companies.map((company) => {
                                        const active = company.id === user?.company_id;
                                        return (
                                            <button
                                                key={company.id}
                                                type="button"
                                                onClick={() => handleSwitchCompany(company)}
                                                className={`w-full px-3.5 py-2 text-left text-sm transition-colors ${
                                                    active
                                                        ? 'bg-slate-900 text-white'
                                                        : 'text-slate-700 hover:bg-slate-50'
                                                }`}
                                            >
                                                <span className="font-medium block truncate">{company.name}</span>
                                                <span className={`text-[11px] ${active ? 'text-slate-300' : 'text-slate-400'}`}>
                                                    {company.slug}
                                                </span>
                                            </button>
                                        );
                                    })}

                                    <div className="h-px bg-slate-100 my-1.5" />

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setCompanyOpen(false);
                                            navigate('/company-settings?create=1');
                                        }}
                                        className="w-full px-3.5 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                                    >
                                        + New company
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setCompanyOpen(false);
                                            navigate('/company-settings');
                                        }}
                                        className="w-full px-3.5 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                                    >
                                        Company settings
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

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

                                {(isPlatformAdmin || can('companies-view')) && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsOpen(false);
                                            navigate('/company-settings');
                                        }}
                                        className="w-full px-3.5 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                                    >
                                        Company Settings
                                    </button>
                                )}

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
