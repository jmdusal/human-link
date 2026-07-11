import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Lock } from 'lucide-react';
import { AuthService } from '@/services/AuthService';
import { usePageTitle } from '@/hooks/use-title';

export default function ResetPassword() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const isInvite = params.get('invite') === '1';
    usePageTitle(isInvite ? 'Set password' : 'Reset password');

    const token = params.get('token') || '';
    const email = params.get('email') || '';

    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const canSubmit = useMemo(
        () => Boolean(token && email && password && passwordConfirmation),
        [token, email, password, passwordConfirmation],
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;
        setLoading(true);
        setError(null);
        try {
            await AuthService.resetPassword({
                token,
                email,
                password,
                passwordConfirmation,
            });
            navigate('/login', { replace: true, state: { resetSuccess: true } });
        } catch (err: any) {
            setError(
                err.response?.data?.errors?.password?.[0]
                || err.response?.data?.errors?.email?.[0]
                || err.response?.data?.message
                || 'Unable to reset password.',
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#FAFAFA]">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[400px] mx-4">
                <div className="bg-white border border-slate-200 rounded-[24px] p-10 shadow-sm">
                    <h1 className="text-xl font-semibold text-slate-800 tracking-tight">
                        {isInvite ? 'Welcome — set your password' : 'Choose a new password'}
                    </h1>
                    <p className="text-sm text-slate-500 mt-1.5 mb-6">
                        {isInvite
                            ? 'Finish onboarding for your HumanLink account.'
                            : `Resetting password for ${email || 'your account'}.`}
                    </p>

                    {error && <p className="mb-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl p-3">{error}</p>}

                    {!token || !email ? (
                        <p className="text-sm text-slate-600">This reset link is invalid or incomplete.</p>
                    ) : (
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <input
                                    type="password"
                                    required
                                    minLength={8}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="New password"
                                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-slate-100"
                                />
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <input
                                    type="password"
                                    required
                                    minLength={8}
                                    value={passwordConfirmation}
                                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                                    placeholder="Confirm password"
                                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-slate-100"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading || !canSubmit}
                                className="w-full py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isInvite ? 'Activate account' : 'Reset password')}
                            </button>
                        </form>
                    )}

                    <Link to="/login" className="mt-6 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800">
                        <ArrowLeft size={12} /> Back to sign in
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
