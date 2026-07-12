import { useMemo, useState } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import {
    Plus,
    Eye,
    Pencil,
    Trash2,
    ClipboardList,
    LayoutGrid,
    List,
    Calendar,
    Mail,
    Briefcase,
    Send,
    KeyRound,
    UserX,
    UserCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import UserProfile from '@/components/modals/users/UserProfile';
import EmployeeLifecycleModal from '@/components/modals/users/EmployeeLifecycleModal';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import UserForm from '@/components/modals/users/UserForm';
import ModalConfirmation from '@/components/modals/ModalConfirmation';
import TableActions from '@/components/shared/TableActions';
import { DataTable } from '@/components/shared/Datatable';
import Searchbar from '@/components/shared/Searchbar';
import Pagination from '@/components/ui/Pagination';
import { useAuth } from '@/context/AuthContext';
import type { HrStatus, User } from '@/types';
import { UserService } from '@/services/UserService';
import { useUsers } from '@/hooks/use-users';
import { StatusBadge, UserCell, RoleBadge, TextCell } from '@/components/shared/TableCells';
import { getInitials } from '@/utils/userUtils';
import { AnimatePresence } from 'framer-motion';

const columnHelper = createColumnHelper<User>();

type HrStatusFilter = 'all' | HrStatus;
type ConfirmAction = 'delete' | 'deactivate' | 'activate' | 'resendInvite' | 'forcePasswordReset';

const HR_STATUS_FILTERS: { value: HrStatusFilter; label: string }[] = [
    { value: 'all', label: 'All HR statuses' },
    { value: 'incomplete', label: 'Incomplete' },
    { value: 'ready', label: 'Ready' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'offboarding', label: 'Offboarding' },
];

function formatUserType(user: { userType?: string | null; assignedUserType?: { name?: string } | null }): string {
    const label = user.assignedUserType?.name || user.userType;
    if (!label) return '';
    return label.charAt(0).toUpperCase() + label.slice(1);
}

const CONFIRM_COPY: Record<ConfirmAction, {
    title: string;
    message: (name: string) => string;
    confirmText: string;
    variant: 'danger' | 'warning' | 'info';
    success: string;
}> = {
    delete: {
        title: 'Delete User',
        message: (name) => `Are you sure you want to delete ${name}? This action is permanent.`,
        confirmText: 'Delete',
        variant: 'danger',
        success: 'User removed successfully.',
    },
    deactivate: {
        title: 'Deactivate User',
        message: (name) =>
            `Deactivate ${name}? They will lose access immediately. This is not an offboard — use Lifecycle for exits.`,
        confirmText: 'Deactivate',
        variant: 'warning',
        success: 'User deactivated successfully.',
    },
    activate: {
        title: 'Activate User',
        message: (name) => `Restore access for ${name}?`,
        confirmText: 'Activate',
        variant: 'info',
        success: 'User activated successfully.',
    },
    resendInvite: {
        title: 'Resend Invite',
        message: (name) => `Send a new invite email to ${name}?`,
        confirmText: 'Send invite',
        variant: 'info',
        success: 'Invite email resent.',
    },
    forcePasswordReset: {
        title: 'Force Password Reset',
        message: (name) =>
            `Send a password reset email to ${name}? They must set a new password before signing in again.`,
        confirmText: 'Send reset',
        variant: 'warning',
        success: 'Password reset email sent.',
    },
};

function userHrStatus(user: User): HrStatus {
    return user.hrStatus ?? (user.status === 'inactive' ? 'inactive' : 'active');
}

function userIsActive(user: User): boolean {
    if (typeof user.isActive === 'boolean') return user.isActive;
    return user.status === 'active';
}

function canResendInvite(user: User): boolean {
    if (user.terminatedAt || user.status === 'inactive') return false;
    return Boolean(user.mustSetPassword) || !user.emailVerifiedAt;
}

export default function UserIndex() {
    const { can } = useAuth();
    const { users, setUsers, loading } = useUsers(true);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const [viewMode, setViewMode] = useState<'grid' | 'list' | 'timeline'>('list');
    const [globalFilter, setGlobalFilter] = useState('');
    const [hrStatusFilter, setHrStatusFilter] = useState<HrStatusFilter>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isLifecycleOpen, setIsLifecycleOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
    const [isConfirming, setIsConfirming] = useState(false);

    const filteredUsers = useMemo(() => {
        const query = globalFilter.toLowerCase().trim();

        return users.filter((user) => {
            const hrStatus = userHrStatus(user);
            if (hrStatusFilter !== 'all' && hrStatus !== hrStatusFilter) {
                return false;
            }

            if (!query) return true;

            return user.name.toLowerCase().includes(query)
                || user.email.toLowerCase().includes(query)
                || (user.details?.jobTitle ?? '').toLowerCase().includes(query)
                || (user.details?.department ?? '').toLowerCase().includes(query)
                || (user.assignedUserType?.name ?? user.userType ?? '').toLowerCase().includes(query)
                || user.status.toLowerCase().includes(query)
                || hrStatus.toLowerCase().includes(query);
        });
    }, [users, globalFilter, hrStatusFilter]);

    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const timelineUsers = useMemo(() => {
        return [...filteredUsers].sort((a, b) => {
            const aDate = a.hiredAt || a.createdAt;
            const bDate = b.hiredAt || b.createdAt;
            return new Date(aDate).getTime() - new Date(bDate).getTime();
        });
    }, [filteredUsers]);

    const upsertUser = (userData: User) => {
        setUsers((prev) => prev.map((user) => (user.id === userData.id ? { ...user, ...userData } : user)));
        setSelectedUser((prev) => (prev?.id === userData.id ? { ...prev, ...userData } : prev));
    };

    const handleAdd = () => {
        setSelectedUser(null);
        setIsFormOpen(true);
    };

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setIsFormOpen(true);
    };

    const handleView = (user: User) => {
        setSelectedUser(user);
        setIsViewOpen(true);
    };

    const handleLifecycle = (user: User) => {
        setSelectedUser(user);
        setIsLifecycleOpen(true);
    };

    const handleSuccess = (userData: User) => {
        if (selectedUser) {
            upsertUser(userData);
        } else {
            setUsers((prev) => [userData, ...prev]);
        }
    };

    const handleError = (error: any) => {
        console.error('Form Error:', error);
    };

    const openConfirm = (user: User, action: ConfirmAction) => {
        setSelectedUser(user);
        setConfirmAction(action);
    };

    const handleConfirmAction = async () => {
        if (!selectedUser || !confirmAction) return;
        setIsConfirming(true);

        try {
            if (confirmAction === 'delete') {
                await UserService.deleteUser(selectedUser.id);
                setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
            } else if (confirmAction === 'deactivate') {
                upsertUser(await UserService.deactivateUser(selectedUser.id));
            } else if (confirmAction === 'activate') {
                upsertUser(await UserService.activateUser(selectedUser.id));
            } else if (confirmAction === 'resendInvite') {
                upsertUser(await UserService.resendInvite(selectedUser.id));
            } else if (confirmAction === 'forcePasswordReset') {
                upsertUser(await UserService.forcePasswordReset(selectedUser.id));
            }

            toast.success(CONFIRM_COPY[confirmAction].success);
            setConfirmAction(null);
            setSelectedUser(null);
        } catch (err: any) {
            const message = err?.response?.data?.message
                || err?.response?.data?.errors?.user?.[0]
                || 'Action failed.';
            toast.error(message);
            console.error('Confirm action error:', err);
        } finally {
            setIsConfirming(false);
        }
    };

    const userActions = (user: User) => {
        const softInactive = user.status === 'inactive' && !user.terminatedAt;
        const isOffboarded = Boolean(user.terminatedAt);

        return [
            {
                label: 'View',
                icon: Eye,
                onClick: () => handleView(user),
                show: true,
            },
            {
                label: 'Edit',
                icon: Pencil,
                onClick: () => handleEdit(user),
                show: can('users-edit'),
            },
            {
                label: 'Lifecycle',
                icon: ClipboardList,
                onClick: () => handleLifecycle(user),
                show: can('users-edit') || can('users-view'),
            },
            {
                label: 'Resend invite',
                icon: Send,
                onClick: () => openConfirm(user, 'resendInvite'),
                show: can('users-edit') && canResendInvite(user),
            },
            {
                label: 'Force password reset',
                icon: KeyRound,
                onClick: () => openConfirm(user, 'forcePasswordReset'),
                show: can('users-edit') && !softInactive && !isOffboarded,
            },
            {
                label: 'Deactivate',
                icon: UserX,
                onClick: () => openConfirm(user, 'deactivate'),
                show: can('users-edit') && user.status === 'active' && !isOffboarded,
            },
            {
                label: 'Activate',
                icon: UserCheck,
                onClick: () => openConfirm(user, 'activate'),
                show: can('users-edit') && softInactive,
            },
            {
                label: 'Delete',
                icon: Trash2,
                onClick: () => openConfirm(user, 'delete'),
                variant: 'danger' as const,
                show: can('users-delete'),
            },
        ];
    };

    const columns = useMemo(() => [
        columnHelper.accessor('name', {
            header: 'User',
            cell: (info) => {
                const user = info.row.original;
                return (
                    <UserCell
                        name={info.getValue()}
                        email={user.email}
                        subtitle={user.details?.jobTitle}
                    />
                );
            },
        }),
        columnHelper.display({
            id: 'access',
            header: 'Access',
            enableSorting: false,
            cell: (info) => {
                const user = info.row.original;
                const roleName = user.roles?.[0]?.name;
                const typeLabel = formatUserType(user);

                return (
                    <div className="flex flex-wrap items-center gap-1.5">
                        <RoleBadge roleName={roleName} />
                        {typeLabel && (
                            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                                {typeLabel}
                            </span>
                        )}
                    </div>
                );
            },
        }),
        columnHelper.accessor((row) => row.details?.department ?? '', {
            id: 'department',
            header: 'Department',
            cell: (info) => (
                <TextCell title={info.getValue() || '—'} />
            ),
        }),
        columnHelper.accessor((row) => userHrStatus(row), {
            id: 'status',
            header: 'Status',
            cell: (info) => {
                const user = info.row.original;
                const invitePending = canResendInvite(user);
                const accountActive = userIsActive(user);

                return (
                    <div className="flex flex-col items-start gap-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                            <StatusBadge status={info.getValue()} />
                            {!accountActive && (
                                <span className="text-[11px] font-medium text-slate-400">Account off</span>
                            )}
                        </div>
                        {invitePending && (
                            <span className="text-[10px] font-medium tracking-tight text-slate-400">
                                Invite pending
                            </span>
                        )}
                    </div>
                );
            },
        }),
        columnHelper.display({
            id: 'actions',
            size: 50,
            enableSorting: false,
            header: () => <div className="text-right">Actions</div>,
            cell: (info) => (
                <TableActions actions={userActions(info.row.original)} />
            ),
        }),
    ], [can]);

    const filterToolbar = (
        <div className="flex flex-wrap items-center gap-3">
            <div className="max-w-sm w-full sm:w-64">
                <Searchbar
                    value={globalFilter}
                    onChange={(value) => {
                        setGlobalFilter(value);
                        setCurrentPage(1);
                    }}
                    placeholder="Search users..."
                />
            </div>
            <div className="w-full sm:w-[200px]">
                <Select
                    options={HR_STATUS_FILTERS}
                    value={hrStatusFilter}
                    onChange={(value) => {
                        setHrStatusFilter(value as HrStatusFilter);
                        setCurrentPage(1);
                    }}
                    placeholder="HR status"
                />
            </div>
        </div>
    );

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Users</h1>
                    <p className="text-slate-400 text-sm font-medium">Manage people and access.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-slate-100/50 p-1 rounded-xl border border-slate-200/60 mr-2">
                        <button
                            type="button"
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <List size={18} />
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('timeline')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'timeline' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <Calendar size={18} />
                        </button>
                    </div>

                    {can('users-create') && (
                        <Button variant="primary" icon={Plus} onClick={handleAdd}>New User</Button>
                    )}
                </div>
            </div>

            {!loading && (
                <div className="mb-6">
                    {filterToolbar}
                </div>
            )}

            {viewMode === 'list' && (
                <DataTable
                    columns={columns}
                    data={filteredUsers}
                    loading={loading}
                    showSearch={false}
                    countLabel={`${filteredUsers.length} ${filteredUsers.length === 1 ? 'person' : 'people'}`}
                    onRowClick={handleView}
                />
            )}

            {viewMode === 'grid' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 isolate">
                        {loading ? (
                            [...Array(8)].map((_, i) => (
                                <div key={`skeleton-${i}`} className="h-44 bg-slate-50 border border-slate-100 rounded-[28px] animate-pulse" />
                            ))
                        ) : (
                            paginatedUsers.map((user, index) => (
                                <div
                                    key={user.id}
                                    className="group relative flex flex-col justify-between p-6 rounded-[28px] bg-white border border-slate-200 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 cursor-pointer animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                    onClick={() => handleView(user)}
                                >
                                    <div className="flex justify-between items-start gap-3">
                                        <div className="flex items-start gap-3 min-w-0 group-hover:translate-x-1 transition-transform duration-300">
                                            <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                                                <span className="text-xs font-bold text-blue-600 uppercase">
                                                    {getInitials(user.name)}
                                                </span>
                                            </div>
                                            <div className="space-y-1 min-w-0">
                                                <h3 className="font-bold text-slate-800 truncate max-w-[140px]">
                                                    {user.name}
                                                </h3>
                                                <div className="flex items-center gap-1.5 text-slate-400 min-w-0">
                                                    <Mail size={12} className="shrink-0" />
                                                    <span className="text-[11px] truncate lowercase block max-w-[140px]">
                                                        {user.email}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div
                                            className="relative z-[50]"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <TableActions actions={userActions(user)} />
                                        </div>
                                    </div>

                                    <div className="mt-8 space-y-3">
                                        <div className="flex items-center gap-1.5 text-slate-400">
                                            <Briefcase size={12} className="shrink-0" />
                                            <span className="text-[11px] font-medium truncate">
                                                {user.details?.jobTitle || user.assignedUserType?.name || user.userType || 'No title'}
                                                {user.details?.department ? ` · ${user.details.department}` : ''}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <StatusBadge status={userHrStatus(user)} />
                                                <StatusBadge status={userIsActive(user) ? 'active' : 'inactive'} />
                                            </div>
                                            <div
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleView(user);
                                                }}
                                                className="flex items-center gap-1.5 text-slate-900 font-bold text-xs cursor-pointer group/btn"
                                            >
                                                <span className="group-hover/btn:underline decoration-slate-300 underline-offset-4">Open</span>
                                                <Eye size={13} className="text-slate-300 group-hover/btn:text-slate-900 transition-colors" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {!loading && (
                        <div className="pt-4">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={Math.ceil(filteredUsers.length / itemsPerPage)}
                                onPageChange={setCurrentPage}
                                totalItems={filteredUsers.length}
                                itemsPerPage={itemsPerPage}
                            />
                        </div>
                    )}
                </div>
            )}

            {viewMode === 'timeline' && (
                <div className="space-y-6">
                    <div className="relative space-y-12 py-10 overflow-x-auto min-h-[500px] animate-in fade-in duration-700 bg-slate-50/30 rounded-[32px] border border-slate-100/50">
                        {loading ? (
                            <div className="px-10 text-sm text-slate-400">Loading users…</div>
                        ) : timelineUsers.length === 0 ? (
                            <div className="px-10 text-sm text-slate-400">No users found.</div>
                        ) : (
                            <div className="flex gap-12 pb-12 min-w-max px-10">
                                {timelineUsers.map((user, index) => {
                                    const eventDate = user.hiredAt || user.createdAt;

                                    return (
                                        <div key={user.id} className="relative flex flex-col items-center">
                                            <div className="flex flex-col items-center mb-6">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                                    {new Date(eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                </span>
                                                <div className="h-4 w-[2px] bg-slate-200 mt-2" />
                                            </div>

                                            <div className="relative flex flex-col items-center group">
                                                {index !== timelineUsers.length - 1 && (
                                                    <div className="absolute top-6 left-1/2 w-[calc(100%+48px)] h-[2px] bg-slate-200/60 z-0" />
                                                )}

                                                <div className="w-12 h-12 rounded-2xl bg-white border-2 border-slate-200 shadow-sm flex items-center justify-center z-10 group-hover:border-blue-500 group-hover:shadow-blue-500/10 transition-all duration-500">
                                                    <span className="text-[10px] font-bold text-slate-500 group-hover:text-blue-600 uppercase">
                                                        {getInitials(user.name)}
                                                    </span>
                                                </div>

                                                <div
                                                    className="mt-4 w-64 p-5 rounded-[24px] bg-white border border-slate-200 shadow-sm group-hover:shadow-xl group-hover:shadow-blue-500/5 transition-all cursor-pointer"
                                                    onClick={() => handleView(user)}
                                                >
                                                    <h4 className="font-bold text-slate-800 truncate text-sm">{user.name}</h4>
                                                    <p className="text-[10px] text-slate-400 mt-1 truncate">{user.email}</p>

                                                    <div className="mt-4 flex items-center justify-between gap-2">
                                                        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                                                            <StatusBadge status={userHrStatus(user)} />
                                                            <StatusBadge status={userIsActive(user) ? 'active' : 'inactive'} />
                                                        </div>
                                                        <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase truncate max-w-[110px]">
                                                            {user.details?.jobTitle || user.assignedUserType?.name || user.userType || 'User'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <AnimatePresence>
                {isViewOpen && (
                    <UserProfile
                        key="user-profile-modal"
                        isOpen={isViewOpen}
                        onClose={() => setIsViewOpen(false)}
                        data={selectedUser}
                        onEdit={handleEdit}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isFormOpen && (
                    <UserForm
                        key={selectedUser ? `edit-${selectedUser.id}` : 'create-user'}
                        isOpen={isFormOpen}
                        onClose={() => setIsFormOpen(false)}
                        onSuccess={handleSuccess}
                        onError={handleError}
                        selectedUser={selectedUser}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isLifecycleOpen && (
                    <EmployeeLifecycleModal
                        isOpen={isLifecycleOpen}
                        onClose={() => {
                            setIsLifecycleOpen(false);
                            setSelectedUser(null);
                        }}
                        user={selectedUser}
                        onUserUpdated={(updated) => {
                            setUsers((prev) => prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)));
                            setSelectedUser(updated);
                        }}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {confirmAction && selectedUser && (
                    <ModalConfirmation
                        key={`confirm-${confirmAction}`}
                        isOpen={Boolean(confirmAction)}
                        onClose={() => {
                            setConfirmAction(null);
                            setSelectedUser(null);
                        }}
                        onConfirm={handleConfirmAction}
                        loading={isConfirming}
                        title={CONFIRM_COPY[confirmAction].title}
                        message={CONFIRM_COPY[confirmAction].message(selectedUser.name)}
                        confirmText={CONFIRM_COPY[confirmAction].confirmText}
                        variant={CONFIRM_COPY[confirmAction].variant}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
