import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Mail } from 'lucide-react';
import { AuthService } from '@/services/AuthService';
import { usePageTitle } from '@/hooks/use-title';

export default function ForgotPassword() {
    usePageTitle('Forgot password');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);
        try {
            const result = await AuthService.forgotPassword(email);
            setMessage(result || 'If that email exists, a reset link has been sent.');
        } catch (err: any) {
            setError(err.response?.data?.errors?.email?.[0] || err.response?.data?.message || 'Unable to send reset link.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#FAFAFA]">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[400px] mx-4">
                <div className="bg-white border border-slate-200 rounded-[24px] p-10 shadow-sm">
                    <h1 className="text-xl font-semibold text-slate-800 tracking-tight">Reset password</h1>
                    <p className="text-sm text-slate-500 mt-1.5 mb-6">Enter your work email and we will send a reset link.</p>

                    {message && <p className="mb-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl p-3">{message}</p>}
                    {error && <p className="mb-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl p-3">{error}</p>}

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@company.com"
                                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-slate-100"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send reset link'}
                        </button>
                    </form>

                    <Link to="/login" className="mt-6 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800">
                        <ArrowLeft size={12} /> Back to sign in
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
