import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff, Shield } from 'lucide-react';
import api from '@/api/axios';
import { useAuth } from '@/context/AuthContext';
import { API_ROUTES } from '@/constants';
import { usePageTitle } from '@/hooks/use-title';

const Login = () => {
    usePageTitle("Login")
    const navigate = useNavigate();
    const { user, loading, checkAuth } = useAuth();
    const [email, setEmail] = useState('admin@admin.com');
    const [password, setPassword] = useState('password');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!loading && user) navigate('/dashboard', { replace: true });
    }, [user, loading, navigate]);
    
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);
    
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            await api.get('../sanctum/csrf-cookie'); 
            await api.post(API_ROUTES.AUTH.LOGIN, { email, password });
            await checkAuth();
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Authentication failed.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#FAFAFA] font-sans selection:bg-blue-100">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 left-1/4 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#e2e8f0_0%,transparent_50%)] opacity-40" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full max-w-[400px] mx-4"
            >
                <div className="bg-white border border-slate-200 rounded-[24px] p-10 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_20px_40px_rgba(0,0,0,0.03)] ring-1 ring-inset ring-slate-100">
                    
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-xl">
                            <span className="text-white text-lg font-bold tracking-tighter">HL</span>
                        </div>
                        <h1 className="text-xl font-semibold text-blue-600 tracking-tight">Human Link</h1>
                        <p className="text-slate-500 text-sm mt-1.5 tracking-tight">Sign in to your professional workspace</p>
                    </div>
                    
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="mb-6 p-3.5 bg-red-50/50 border border-red-100 rounded-xl flex items-start gap-3"
                            >
                                <div className="mt-0.5 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                                    <span className="text-white text-[10px] font-bold">!</span>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[11px] font-bold text-red-600 uppercase tracking-widest">System Error</p>
                                    <p className="text-red-700 text-xs font-medium leading-relaxed">{error}</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form className="space-y-4" onSubmit={handleLogin}>
                        <div className="space-y-1">
                            <label className="text-[12px] font-medium text-slate-600 ml-1">Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors w-4 h-4" />
                                <input
                                    type="email"
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); if (error) setError(null); }}
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-slate-100 focus:border-slate-400 transition-all placeholder:text-slate-400 text-[14px] text-slate-800"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[12px] font-medium text-slate-600">Password</label>
                                <a href="#" className="text-[11px] font-semibold text-blue-600 hover:text-blue-700">Forgot?</a>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors w-4 h-4" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); if (error) setError(null); }}
                                    required
                                    className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-slate-100 focus:border-slate-400 transition-all placeholder:text-slate-400 text-[14px] text-slate-800"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ y: -1 }}
                            whileTap={{ y: 0 }}
                            disabled={isLoading}
                            className="w-full py-3 bg-blue-600 hover:bg-blue text-white text-sm font-semibold rounded-xl shadow-lg shadow-slate-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Login'}
                            {!isLoading && <ArrowRight className="w-4 h-4" />}
                        </motion.button>
                    </form>
                </div>

                <div className="mt-8 flex items-center justify-center gap-4 text-slate-400">
                    <div className="flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-medium tracking-tight uppercase">AES-256 Encryption</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-slate-200" />
                    <span className="text-[11px] font-medium tracking-tight uppercase">System Status: Stable</span>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
