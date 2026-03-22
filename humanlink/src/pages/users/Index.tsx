import { useMemo, useState } from 'react';
import { createColumnHelper } from "@tanstack/react-table";
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import UserProfile from '@/components/modals/users/UserProfile';
import Button from '@/components/Button';
import UserForm from '@/pages/users/UserForm';
import ModalConfirmation from '@/components/modals/ModalConfirmation';
import TableActions from '@/components/TableActions';
import { DataTable } from '@/components/Datatable';
import { useAuth } from '@/context/AuthContext';
import type { User } from '@/types/models';
import { UserService } from '@/services/UserService';
import { useUsers } from '@/hooks/useUsers';
import { DateCell, StatusBadge, UserCell, RoleBadge } from '@/components/TableCells';

const columnHelper = createColumnHelper<User>();

export default function UserIndex() {
    const { can } = useAuth();
    const { users, setUsers, loading } = useUsers(true);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    
    const [openDropdown, setOpenDropdown] = useState<number | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
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

    const handleSuccess = (userData: User) => {
        if (selectedUser) {
            setUsers(prev => prev.map(user => user.id === userData.id ? userData : user));
        } else {
            setUsers(prev => [userData, ...prev]);
        }
    };

    const handleError = (error: any) => {
        // alert("Something went wrong. Please try again.");
        console.error("Form Error:", error);
    };
    
    const handleDeleteClick = (user: User) => {
        setSelectedUser(user);
        setIsDeleteModalOpen(true);
        setOpenDropdown(null);
    };
    
    const handleConfirmDelete = async () => {
        if (!selectedUser) return;
        setIsDeleting(true);
        // const toastId = toast.loading('Processing...');
        
        try {
            await UserService.deleteUser(selectedUser.id);
            
            // toast.success(<b>User removed successfully.</b>, { id: toastId });
            setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
            toast.success('User removed successfully.');
            setIsDeleteModalOpen(false);
            
        } catch (err: any) {
            console.error("Delete Error:", err);

            // const errorMessage = err.response?.data?.message || 'Failed to delete user.';
            // toast.error(<b>{errorMessage}</b>, { id: toastId });
            
        } finally {
            setIsDeleting(false);
            setSelectedUser(null);
        }
        
        // toast.success(`User ${selectedUser ? 'updated' : 'created'} successfully!`);
        // toast.promise(
        //     api.delete(API_ROUTES.USERS.DELETE(selectedUser.id)),
        //     {
        //         loading: 'Processing deletion...',
        //         success: () => {
        //             setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
        //             setIsDeleteModalOpen(false);
        //             return <b>User removed successfully.</b>;
        //         },
        //         error: (err) => {
        //             console.error(err);
        //             return <b>Failed to delete user.</b>;
        //         },
        //     }
        // ).finally(() => setIsDeleting(false));
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
        columnHelper.accessor('status', {
            header: 'Status',
            cell: (info) => <StatusBadge status={info.getValue()} />,
        }),
        columnHelper.accessor('createdAt', {
            header: 'Created',
            cell: (info) => <DateCell date={info.getValue()} />,
            // cell: (info) => <DateCell value={formatDate(info.getValue())} />,
        }),
        columnHelper.display({
            id: 'actions',
            cell: (info) => {
                return (
                    <TableActions 
                        actions={[
                            {
                                label: 'View',
                                icon: Eye,
                                onClick: () => handleView(info.row.original),
                                show: true
                            },
                            { 
                                label: 'Edit',
                                icon: Pencil,
                                onClick: () => handleEdit(info.row.original),
                                show: can('user-edit') 
                            },
                            { 
                                label: 'Delete',
                                icon: Trash2,
                                onClick: () => handleDeleteClick(info.row.original),
                                variant: 'danger',
                                show: can('user-delete')
                            },
                        ]}
                    />
                );
            },
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

                {can('user-create') && (
                    <Button variant="primary" icon={Plus} onClick={handleAdd}>Add User</Button>
                )}
            </div>

            <DataTable
                columns={columns}
                data={users}
                loading={loading}
                showSearch={true}
            />
            
            {isFormOpen && (
                <UserForm
                    isOpen={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                    onSuccess={handleSuccess}
                    onError={handleError}
                    selectedUser={selectedUser}
                />
            )}

            {isViewOpen && (
                <UserProfile
                    isOpen={isViewOpen}
                    onClose={() => setIsViewOpen(false)}
                    title="User Details"
                    data={selectedUser}
                />
            )}
            
            <ModalConfirmation 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                loading={isDeleting}
                title="Delete User"
                message={`Are you sure you want to delete ${selectedUser?.name}? This action is permanent.`}
            />
        </div>
    );
}