import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import api from '@/api/axios';
import { useAuth } from '@/context/AuthContext';
import { API_ROUTES } from '@/constants';

const Login = () => {
    const navigate = useNavigate();
    const { user, setUser, loading, checkAuth } = useAuth();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!loading && user) {
            navigate('/dashboard', { replace: true });
        }
    }, [user, loading, navigate]);
    
    useEffect(() => {
        setEmail('admin@admin.com');
        setPassword('password');
    }, []);
    
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError(null);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [error]);
    
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        
        setIsLoading(true);
        setError(null);

        try {
            // await api.get('/../sanctum/csrf-cookie'); 
            // await api.get('http://localhost:8000/sanctum/csrf-cookie');
            await api.get('../sanctum/csrf-cookie'); 

            await api.post(API_ROUTES.AUTH.LOGIN, {
                email: email,
                password: password
            });
            
            // await api.post('/login', {
            //     email: email,
            //     password: password
            // });
            
            // console.log("Authenticated User:", response.data.user);
            // setUser(response.data.user);
            await checkAuth();
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
            console.error("Login failed", err.response?.data);
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#dbeafe] via-[#e0f2fe] to-[#bfdbfe] font-sans">
        <div className="absolute top-20 left-20 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative z-10 w-full max-w-md p-8 mx-4 bg-white/40 backdrop-blur-xl border border-white/40 rounded-[2.5rem] shadow-2xl"
        >
            <div className="flex flex-col items-center mb-10">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
                    <span className="text-white text-3xl font-bold italic">H</span>
                </div>
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Human Link</h1>
            </div>

            {/* Error Message Display */}
            {/* {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-600 text-sm rounded-xl text-center">
                {error}
            </div>
            )} */}
            
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="mb-6 overflow-hidden border-2 border-red-400 bg-red-50/90 rounded-xl shadow-[4px_4px_0px_0px_rgba(248,113,113,0.4)]"
                    >
                        <div className="bg-red-400 px-3 py-1 flex items-center justify-between">
                            <span className="text-[10px] uppercase tracking-widest font-black text-white">System Alert</span>
                            <div className="flex gap-1">
                                <div className="w-2 h-2 rounded-full bg-white/50" />
                                <div className="w-2 h-2 rounded-full bg-white/50" />
                            </div>
                        </div>
                        <div className="p-4 flex items-center gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center border border-red-200">
                                <span className="text-red-600 font-bold text-lg">!</span>
                            </div>
                            <p className="text-red-700 text-sm font-medium leading-tight">
                                {error}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <form className="space-y-6" onSubmit={handleLogin}>
                <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
                    <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError(null);
                    }}
                    required
                    className="w-full pl-12 pr-4 py-4 bg-white/50 border border-white/20 rounded-2xl outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/80 transition-all placeholder:text-slate-400 text-slate-700"
                    />
                </div>

                <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
                    <input
                    // type="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) setError(null);
                    }}
                    required
                    className="w-full pl-12 pr-4 py-4 bg-white/50 border border-white/20 rounded-2xl outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/80 transition-all placeholder:text-slate-400 text-slate-700"
                    />
                    <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors"
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isLoading}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
                    {!isLoading && <ArrowRight className="w-5 h-5" />}
                </motion.button>
            </form>

            <div className="mt-8 text-center">
                <a href="#" className="text-sm text-blue-600 hover:underline font-medium">Forgot password?</a>
            </div>
            </motion.div>
        </div>
    );
};

export default Login;