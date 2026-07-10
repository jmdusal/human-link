import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { WorkspaceService } from '@/services/WorkspaceService';
import { usePageTitle } from '@/hooks/use-title';

type AcceptState = 'loading' | 'success' | 'error';

export default function AcceptInvitation() {
    usePageTitle('Accept Invitation');
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const [state, setState] = useState<AcceptState>('loading');
    const [message, setMessage] = useState('Accepting your invitation...');
    const [workspaceSlug, setWorkspaceSlug] = useState<string | null>(null);
    const requestStartedRef = useRef(false);

    useEffect(() => {
        if (!token) {
            setState('error');
            setMessage('Invalid invitation link.');
            return;
        }

        // React Strict Mode remounts effects; only accept once per page load.
        if (requestStartedRef.current) {
            return;
        }

        requestStartedRef.current = true;

        (async () => {
            try {
                const workspace = await WorkspaceService.acceptInvitation(token);

                setWorkspaceSlug(workspace.slug);
                setMessage(`You're now a member of ${workspace.name}.`);
                setState('success');
            } catch (error: any) {
                requestStartedRef.current = false;
                setMessage(
                    error?.response?.data?.message
                    || 'This invitation could not be accepted. It may be invalid or meant for another account.'
                );
                setState('error');
            }
        })();
    }, [token]);

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white border border-slate-200 shadow-sm p-8 text-center">
                {state === 'loading' && (
                    <>
                        <Loader2 className="mx-auto mb-4 text-slate-700 animate-spin" size={36} />
                        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Accepting invitation</h1>
                        <p className="mt-2 text-sm text-slate-500">{message}</p>
                    </>
                )}

                {state === 'success' && (
                    <>
                        <CheckCircle2 className="mx-auto mb-4 text-emerald-600" size={40} />
                        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Welcome aboard</h1>
                        <p className="mt-2 text-sm text-slate-500">{message}</p>
                        <div className="mt-6 flex flex-col gap-3">
                            {workspaceSlug && (
                                <button
                                    type="button"
                                    onClick={() => navigate(`/workspaces/${workspaceSlug}`)}
                                    className="w-full bg-slate-900 text-white text-sm font-semibold py-2.5 hover:bg-slate-800 transition-colors"
                                >
                                    Open workspace
                                </button>
                            )}
                            <Link to="/workspaces" className="text-sm font-medium text-slate-500 hover:text-slate-800">
                                Back to workspaces
                            </Link>
                        </div>
                    </>
                )}

                {state === 'error' && (
                    <>
                        <XCircle className="mx-auto mb-4 text-rose-600" size={40} />
                        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Invitation unavailable</h1>
                        <p className="mt-2 text-sm text-slate-500">{message}</p>
                        <Link
                            to="/workspaces"
                            className="inline-block mt-6 text-sm font-semibold text-slate-900 hover:underline"
                        >
                            Go to workspaces
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}
