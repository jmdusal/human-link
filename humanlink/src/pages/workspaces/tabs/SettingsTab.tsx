import { useEffect, useMemo, useState } from 'react';
import { Archive, Settings, LogOut, Save, UserCog, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { useAuth } from '@/context/AuthContext';
import { usePageTitle } from '@/hooks/use-title';
import { acceptedMembers } from '@/utils/workspaceMetrics';
import { useWorkspacePermissions } from '@/utils/workspacePermissions';

interface SettingsTabProps {
    data: any;
    onRename: (name: string) => Promise<void>;
    onArchive: () => void;
    onDelete: () => void;
    onLeave: () => void;
    onTransferOwnership: (userId: number) => Promise<void>;
    saving?: boolean;
    transferring?: boolean;
}

export default function SettingsTab({
    data,
    onRename,
    onArchive,
    onDelete,
    onLeave,
    onTransferOwnership,
    saving = false,
    transferring = false,
}: SettingsTabProps) {
    usePageTitle('Settings');
    const { user } = useAuth();
    const [name, setName] = useState(data?.name || '');
    const [transferUserId, setTransferUserId] = useState('');
    const { isOwner, canManage: isAdminOrOwner, canLeave } = useWorkspacePermissions(data);

    useEffect(() => {
        setName(data?.name || '');
    }, [data?.name]);

    const nameChanged = name.trim() !== (data?.name || '') && name.trim().length > 0;

    const transferOptions = useMemo(() => {
        return acceptedMembers(data.members || [])
            .filter((m: any) => m.id !== user?.id)
            .map((m: any) => ({
                label: m.name || m.email,
                value: String(m.id),
            }));
    }, [data.members, user?.id]);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 flex flex-col min-h-full space-y-8 pb-10">
            <div>
                <h3 className="text-3xl font-bold text-slate-900 tracking-tight">Settings</h3>
                <p className="text-slate-400 text-sm mt-1 font-medium">
                    Manage workspace details and access for {data.name}.
                </p>
            </div>

            {isAdminOrOwner && (
                <Card variant="section">
                    <div className="flex items-start gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center shrink-0">
                            <Settings size={18} />
                        </div>
                        <div>
                            <h4 className="text-base font-bold text-slate-900">General</h4>
                            <p className="text-sm text-slate-400 font-medium mt-0.5">
                                Rename this workspace. The URL slug updates from the name.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 items-end max-w-xl">
                        <div className="flex-1 w-full">
                            <Input
                                label="Workspace name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Workspace name"
                            />
                        </div>
                        <Button
                            variant="primary"
                            icon={Save}
                            loading={saving}
                            disabled={!nameChanged || saving}
                            onClick={() => onRename(name.trim())}
                        >
                            Save
                        </Button>
                    </div>
                </Card>
            )}

            {isOwner && (
                <Card variant="section">
                    <div className="flex items-start gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center shrink-0">
                            <UserCog size={18} />
                        </div>
                        <div>
                            <h4 className="text-base font-bold text-slate-900">Transfer ownership</h4>
                            <p className="text-sm text-slate-400 font-medium mt-0.5">
                                Pass ownership to another accepted member. You become an admin.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 items-end max-w-xl">
                        <div className="flex-1 w-full">
                            <Select
                                label="New owner"
                                options={transferOptions}
                                value={transferUserId}
                                onChange={setTransferUserId}
                                placeholder="Select a member"
                            />
                        </div>
                        <Button
                            variant="secondary"
                            icon={UserCog}
                            loading={transferring}
                            disabled={!transferUserId || transferring}
                            onClick={() => onTransferOwnership(Number(transferUserId))}
                        >
                            Transfer
                        </Button>
                    </div>
                </Card>
            )}

            {canLeave && (
                <Card className="border border-amber-100 bg-amber-50/30 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center md:text-left">
                        <h4 className="text-lg font-bold text-amber-900">Leave workspace</h4>
                        <p className="text-amber-700/80 text-sm mt-1 font-medium max-w-md">
                            You will lose access to projects and tasks in this workspace until invited again.
                        </p>
                    </div>
                    <Button variant="outline" icon={LogOut} onClick={onLeave}>
                        Leave workspace
                    </Button>
                </Card>
            )}

            {isOwner && (
                <Card className="bg-amber-50/20 border-dashed border-amber-100 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center md:text-left">
                        <h4 className="text-xl font-bold text-amber-900">Archive workspace</h4>
                        <p className="text-amber-700/80 text-sm mt-1 font-medium max-w-sm">
                            Hide this workspace from active lists. Projects and tasks stay intact and can be restored later.
                        </p>
                    </div>
                    <Button variant="outline" icon={Archive} onClick={onArchive}>
                        Archive workspace
                    </Button>
                </Card>
            )}

            {isOwner && (
                <Card className="bg-red-50/20 border-dashed border-red-100 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center md:text-left">
                        <h4 className="text-xl font-bold text-red-900">Delete workspace</h4>
                        <p className="text-red-400 text-sm mt-1 font-medium max-w-sm">
                            Permanently delete this workspace and its projects, tasks, statuses, and tags. This cannot be undone.
                        </p>
                    </div>
                    <Button variant="danger" icon={Trash2} onClick={onDelete}>
                        Delete workspace
                    </Button>
                </Card>
            )}
        </div>
    );
}
