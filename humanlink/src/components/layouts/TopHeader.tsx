import { useState, useRef, useEffect } from 'react';
import { LogOut, User, Settings, ChevronDown, Sparkles } from 'lucide-react'; // Added Sparkles for 'Elite' feel
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/api/axios';
import Notification from '@/components/layouts/Notification';
import { useAuth } from '@/context/AuthContext';
import { API_ROUTES } from '@/constants';

export default function TopHeader() {
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
            console.error("Logout failed", error);
            setUser(null);
            navigate('/login');
        }
    };

    return (
        <header className="h-14 bg-[#F8FAFC]/40 backdrop-blur-xl border-b border-slate-200/40 flex items-center justify-between px-8 relative z-50">
            
            <div className="relative w-96">
                {/* Search Bar placeholder  */}
            </div>

            <div className="flex items-center gap-4">
                <div className="scale-90 origin-right">
                    <Notification /> 
                </div>

                {/* User Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className={`flex items-center gap-2.5 p-1 pr-3 rounded-full transition-all duration-300 border ${
                            isOpen ? 'bg-white border-slate-200 shadow-sm' : 'border-transparent hover:bg-white hover:border-slate-200'
                        }`}
                    >
                        <div className="relative">
                            <img 
                                src="https://ui-avatars.com" 
                                className="h-8 w-8 rounded-full shadow-inner border border-slate-100 object-cover" 
                                alt="Avatar" 
                            />
                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                        </div>
                        
                        <div className="text-left hidden sm:block">
                            <p className="text-[13px] font-bold text-slate-900 leading-none tracking-tight">
                                {user?.name || 'Admin User'}
                            </p>
                            <div className="flex items-center gap-1 mt-0.5">
                                <span className="text-[9px] text-blue-600 font-black uppercase tracking-[0.05em] bg-blue-50 px-1 rounded">PRO</span>
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Superuser</span>
                            </div>
                        </div>
                        <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.98, filter: 'blur(4px)' }}
                                animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                                exit={{ opacity: 0, y: 8, scale: 0.98, filter: 'blur(4px)' }}
                                transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                                className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-2xl border border-slate-200/60 rounded-[1.25rem] shadow-[0_10px_40px_rgba(0,0,0,0.08)] overflow-hidden p-1.5"
                            >
                                <div className="px-3 py-3 mb-1 bg-slate-50/50 rounded-xl border border-slate-100/50">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Sparkles size={10} className="text-blue-500" /> Account Settings
                                    </p>
                                </div>
                                
                                <div className="space-y-0.5">
                                    <button className="w-full flex items-center justify-between px-3 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-all text-sm font-medium group">
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 bg-white border border-slate-100 rounded-md shadow-sm group-hover:border-blue-100">
                                                <User size={15} className="text-slate-500 group-hover:text-blue-500" />
                                            </div>
                                            My Profile
                                        </div>
                                        <span className="text-[10px] text-slate-300 group-hover:text-slate-400">⌘P</span>
                                    </button>
                                    
                                    <button className="w-full flex items-center justify-between px-3 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-all text-sm font-medium group">
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 bg-white border border-slate-100 rounded-md shadow-sm group-hover:border-blue-100">
                                                <Settings size={15} className="text-slate-500 group-hover:text-blue-500" />
                                            </div>
                                            System Settings
                                        </div>
                                        <span className="text-[10px] text-slate-300 group-hover:text-slate-400">⌘S</span>
                                    </button>
                                </div>

                                <div className="h-px bg-slate-100/80 my-1.5 mx-2" />

                                <button 
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-3 py-3 text-red-500 hover:bg-red-50/80 rounded-lg transition-all text-[13px] font-bold group"
                                >
                                    <div className="p-1.5 bg-red-50 border border-red-100 rounded-md">
                                        <LogOut size={15} className="text-red-500" />
                                    </div>
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
