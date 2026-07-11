import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { AuthService } from '@/services/AuthService';
import { usePageTitle } from '@/hooks/use-title';

export default function VerifyEmail() {
    usePageTitle('Verify email');
    const [params] = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verifying your email…');

    useEffect(() => {
        const id = params.get('id');
        const hash = params.get('hash');
        const expires = params.get('expires');
        const signature = params.get('signature');

        if (!id || !hash || !expires || !signature) {
            setStatus('error');
            setMessage('This verification link is invalid or incomplete.');
            return;
        }

        const query = new URLSearchParams({ expires, signature }).toString();

        AuthService.verifyEmail(id, hash, query)
            .then(() => {
                setStatus('success');
                setMessage('Your email is verified. You can sign in.');
            })
            .catch((err: any) => {
                setStatus('error');
                setMessage(err.response?.data?.message || 'Verification failed or the link expired.');
            });
    }, [params]);

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#FAFAFA]">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[400px] mx-4">
                <div className="bg-white border border-slate-200 rounded-[24px] p-10 shadow-sm text-center">
                    {status === 'loading' && <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />}
                    {status === 'success' && <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-4" />}
                    {status === 'error' && <XCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />}
                    <h1 className="text-xl font-semibold text-slate-800">Email verification</h1>
                    <p className="text-sm text-slate-500 mt-2">{message}</p>
                    <Link to="/login" className="inline-block mt-6 text-sm font-semibold text-blue-600 hover:text-blue-700">
                        Go to sign in
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
