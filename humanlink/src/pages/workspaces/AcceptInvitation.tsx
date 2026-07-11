import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, Loader2, Mail, XCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { WorkspaceService } from '@/services/WorkspaceService';
import { usePageTitle } from '@/hooks/use-title';

type InviteState = 'idle' | 'loading' | 'success' | 'declined' | 'error';

export default function AcceptInvitation() {
    usePageTitle('Workspace Invitation');
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const [state, setState] = useState<InviteState>(token ? 'idle' : 'error');
    const [message, setMessage] = useState(
        token ? 'You were invited to join a workspace.' : 'Invalid invitation link.'
    );
    const [workspaceSlug, setWorkspaceSlug] = useState<string | null>(null);

    const handleAccept = async () => {
        if (!token) return;
        setState('loading');
        setMessage('Accepting your invitation...');

        try {
            const workspace = await WorkspaceService.acceptInvitation(token);
            setWorkspaceSlug(workspace.slug);
            setMessage(`You're now a member of ${workspace.name}.`);
            setState('success');
        } catch (error: any) {
            setMessage(
                error?.response?.data?.message
                || 'This invitation could not be accepted. It may be invalid or meant for another account.'
            );
            setState('error');
        }
    };

    const handleDecline = async () => {
        if (!token) return;
        setState('loading');
        setMessage('Declining invitation...');

        try {
            await WorkspaceService.declineInvitation(token);
            setMessage('Invitation declined. You were not added to the workspace.');
            setState('declined');
        } catch (error: any) {
            setMessage(
                error?.response?.data?.message
                || 'This invitation could not be declined. It may already be used or invalid.'
            );
            setState('error');
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white border border-slate-200 shadow-sm p-8 text-center">
                {state === 'idle' && (
                    <>
                        <Mail className="mx-auto mb-4 text-slate-700" size={36} />
                        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Workspace invitation</h1>
                        <p className="mt-2 text-sm text-slate-500">{message}</p>
                        <div className="mt-6 flex flex-col gap-3">
                            <Button variant="primary" onClick={handleAccept} className="w-full justify-center">
                                Accept invitation
                            </Button>
                            <Button variant="outline" onClick={handleDecline} className="w-full justify-center">
                                Decline
                            </Button>
                            <Link to="/workspaces" className="text-sm font-medium text-slate-500 hover:text-slate-800">
                                Back to workspaces
                            </Link>
                        </div>
                    </>
                )}

                {state === 'loading' && (
                    <>
                        <Loader2 className="mx-auto mb-4 text-slate-700 animate-spin" size={36} />
                        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Please wait</h1>
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
                                <Button
                                    variant="primary"
                                    onClick={() => navigate(`/workspaces/${workspaceSlug}`)}
                                    className="w-full justify-center"
                                >
                                    Open workspace
                                </Button>
                            )}
                            <Link to="/workspaces" className="text-sm font-medium text-slate-500 hover:text-slate-800">
                                Back to workspaces
                            </Link>
                        </div>
                    </>
                )}

                {state === 'declined' && (
                    <>
                        <XCircle className="mx-auto mb-4 text-slate-400" size={40} />
                        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Invitation declined</h1>
                        <p className="mt-2 text-sm text-slate-500">{message}</p>
                        <Link
                            to="/workspaces"
                            className="inline-block mt-6 text-sm font-semibold text-slate-900 hover:underline"
                        >
                            Go to workspaces
                        </Link>
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
