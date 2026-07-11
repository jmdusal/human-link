import { useMemo, useState } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { Plus, Eye, Pencil, Trash2, ClipboardList } from 'lucide-react';
import toast from 'react-hot-toast';
import UserProfile from '@/components/modals/users/UserProfile';
import EmployeeLifecycleModal from '@/components/modals/users/EmployeeLifecycleModal';
import Button from '@/components/ui/Button';
import UserForm from '@/components/modals/users/UserForm';
import ModalConfirmation from '@/components/modals/ModalConfirmation';
import TableActions from '@/components/shared/TableActions';
import { DataTable } from '@/components/shared/Datatable';
import { useAuth } from '@/context/AuthContext';
import type { User } from '@/types';
import { UserService } from '@/services/UserService';
import { useUsers } from '@/hooks/use-users';
import { DateCell, StatusBadge, UserCell, RoleBadge, TextCell } from '@/components/shared/TableCells';
import { AnimatePresence } from 'framer-motion';

const columnHelper = createColumnHelper<User>();

export default function UserIndex() {
    const { can } = useAuth();
    const { users, setUsers, loading } = useUsers(true);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const [openDropdown, setOpenDropdown] = useState<number | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isLifecycleOpen, setIsLifecycleOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleAdd = () => {
        setSelectedUser(null);
        setIsFormOpen(true);
    };

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setIsFormOpen(true);
        setOpenDropdown(null);
    };

    const handleView = (user: User) => {
        setSelectedUser(user);
        setIsViewOpen(true);
        setOpenDropdown(null);
    };

    const handleLifecycle = (user: User) => {
        setSelectedUser(user);
        setIsLifecycleOpen(true);
        setOpenDropdown(null);
    };

    const handleSuccess = (userData: User) => {
        if (selectedUser) {
            setUsers((prev) => prev.map((user) => (user.id === userData.id ? userData : user)));
        } else {
            setUsers((prev) => [userData, ...prev]);
        }
    };

    const handleError = (error: any) => {
        console.error('Form Error:', error);
    };

    const handleDeleteClick = (user: User) => {
        setSelectedUser(user);
        setIsDeleteModalOpen(true);
        setOpenDropdown(null);
    };

    const handleConfirmDelete = async () => {
        if (!selectedUser) return;
        setIsDeleting(true);

        try {
            await UserService.deleteUser(selectedUser.id);
            setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
            toast.success('User removed successfully.');
            setIsDeleteModalOpen(false);
        } catch (err: any) {
            console.error('Delete Error:', err);
        } finally {
            setIsDeleting(false);
            setSelectedUser(null);
        }
    };

    const columns = useMemo(() => [
        columnHelper.accessor('name', {
            header: 'User Identity',
            cell: (info) => (
                <UserCell
                    name={info.getValue()}
                    email={info.row.original.email}
                />
            ),
        }),
        columnHelper.accessor('roles', {
            header: 'Roles',
            cell: (info) => {
                const roles = info.getValue();
                const roleName = roles?.[0]?.name;

                return <RoleBadge roleName={roleName} />;
            },
        }),
        columnHelper.accessor('userType', {
            header: 'Type',
            cell: (info) => {
                const userType = info.getValue();
                return <TextCell title={userType ? userType.charAt(0).toUpperCase() + userType.slice(1) : '—'} />;
            },
        }),
        columnHelper.accessor('status', {
            header: 'Status',
            cell: (info) => <StatusBadge status={info.getValue()} />,
        }),
        columnHelper.accessor('createdAt', {
            header: 'Created',
            cell: (info) => <DateCell date={info.getValue()} />,
        }),
        columnHelper.display({
            id: 'actions',
            size: 50,
            header: () => <div className="text-right">Actions</div>,
            cell: (info) => (
                <TableActions
                    actions={[
                        {
                            label: 'View',
                            icon: Eye,
                            onClick: () => handleView(info.row.original),
                            show: true,
                        },
                        {
                            label: 'Edit',
                            icon: Pencil,
                            onClick: () => handleEdit(info.row.original),
                            show: can('users-edit'),
                        },
                        {
                            label: 'Lifecycle',
                            icon: ClipboardList,
                            onClick: () => handleLifecycle(info.row.original),
                            show: can('users-edit') || can('users-view'),
                        },
                        {
                            label: 'Delete',
                            icon: Trash2,
                            onClick: () => handleDeleteClick(info.row.original),
                            variant: 'danger',
                            show: can('users-delete'),
                        },
                    ]}
                />
            ),
        }),
    ], [openDropdown, can]);

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">User Management</h1>
                        <p className="text-slate-400 text-sm font-medium">Manage operators and system access levels.</p>
                    </div>
                </div>

                {can('users-create') && (
                    <Button variant="primary" icon={Plus} onClick={handleAdd}>New User</Button>
                )}
            </div>

            <DataTable
                columns={columns}
                data={users}
                loading={loading}
                showSearch={true}
            />

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
                {isViewOpen && (
                    <UserProfile
                        key="user-profile-modal"
                        isOpen={isViewOpen}
                        onClose={() => setIsViewOpen(false)}
                        title="User Details"
                        data={selectedUser}
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
                {isDeleteModalOpen && (
                    <ModalConfirmation
                        key="delete-confirmation"
                        isOpen={isDeleteModalOpen}
                        onClose={() => setIsDeleteModalOpen(false)}
                        onConfirm={handleConfirmDelete}
                        loading={isDeleting}
                        title="Delete User"
                        message={`Are you sure you want to delete ${selectedUser?.name}? This action is permanent.`}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
