import { useState, useRef, useEffect } from 'react';
import { LogOut, User, Settings, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/api/axios';
import Notification from '@/components/Notification';
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
    <header className="h-20 bg-[#F0F2F5]/80 backdrop-blur-md border-b border-white flex items-center justify-between px-8 relative z-50">
        {/* Search Bar */}
        <div className="relative w-96">
            {/* <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
            type="text"
            placeholder="Search anything..."
            className="w-full bg-slate-200/50 border border-white rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:ring-2 ring-blue-500/20 transition-all text-sm"
            /> */}
        </div>

        <div className="flex items-center gap-6">
            {/* Notification */}
            <Notification /> 
            {/* <button className="relative p-2 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-500 hover:text-blue-600 transition-colors">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button> */}

            {/* User Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-3 p-1 pr-3 hover:bg-white/50 rounded-2xl transition-all border border-transparent hover:border-white"
                >
                    <img 
                    src="https://ui-avatars.com" 
                    className="h-10 w-10 rounded-xl shadow-md border-2 border-white object-cover" 
                    alt="Avatar" 
                    />
                    <div className="text-left hidden sm:block">
                        <p className="text-xs font-bold text-slate-800 leading-none">{user?.name || 'JM Admin'}</p>
                        <p className="text-[10px] text-slate-500 font-medium mt-1 uppercase tracking-wider">
                            Superuser
                            {/* {user?.role || 'Superuser'} */}
                        </p>
                    </div>
                    <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-3 w-56 bg-white/90 backdrop-blur-xl border border-white rounded-[1.5rem] shadow-xl overflow-hidden py-2"
                        >
                            <div className="px-4 py-3 border-b border-slate-50">
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-tighter">Account Settings</p>
                            </div>
                            
                            <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors text-sm">
                                <User size={18} />
                                My Profile
                            </button>
                            
                            <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors text-sm">
                                <Settings size={18} />
                                Settings
                            </button>

                            <div className="h-px bg-slate-50 my-1 mx-4" />

                            <button 
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 transition-colors text-sm font-semibold"
                            >
                            <LogOut size={18} />
                            Log out
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    </header>
  );
};