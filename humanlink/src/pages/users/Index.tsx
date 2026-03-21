import { useMemo, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { createColumnHelper } from "@tanstack/react-table";
import { Plus, MoreHorizontal, Shield, Eye, Pencil, Trash2, 
    User2Icon
} from 'lucide-react';
import UserProfile from '@/components/modals/users/UserProfile';
import Button from '@/components/Button';
import api from '@/api/axios';
import UserForm from '@/pages/users/UserForm';
import ModalConfirmation from '@/components/modals/ModalConfirmation';
import TableActions from '@/components/TableActions';
import { DataTable } from '@/components/Datatable';
import { useAuth } from '@/context/AuthContext';
import { API_ROUTES } from '@/constants';
import type { User } from '@/types/models';

const columnHelper = createColumnHelper<User>();

export default function UserIndex() {
    const { can } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    
    const [loading, setLoading] = useState(true);
    const [openDropdown, setOpenDropdown] = useState<number | null>(null);

    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    
    useEffect(() => {
        api.get(API_ROUTES.USERS.LIST)
           .then(res => setUsers(res.data.data))
           .finally(() => setLoading(false));
    }, []);
    
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
            setUsers(prev => prev.map(u => u.id === userData.id ? userData : u));
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
        toast.promise(
            api.delete(API_ROUTES.USERS.DELETE(selectedUser.id)),
            {
                loading: 'Processing deletion...',
                success: () => {
                    setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
                    setIsDeleteModalOpen(false);
                    return <b>User removed successfully.</b>;
                },
                error: (err) => {
                    console.error(err);
                    return <b>Failed to delete user.</b>;
                },
            }
        ).finally(() => setIsDeleting(false));
    };
    const columns = useMemo(() => [
        columnHelper.accessor('name', {
            header: () => (
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                    User Identity
                </span>
            ),
            cell: (info) => (
                <div className="flex items-center gap-3 py-1">
                    <div className="h-9 w-9 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 font-bold text-xs border border-blue-100/50 shadow-sm">
                        {info.getValue()?.charAt(0).toUpperCase() || '?'}
                    </div>
                    
                    
                    
                    <div>
                        <p className="font-semibold text-slate-900 text-sm leading-none mb-1">{info.getValue()}</p>
                        <p className="text-[11px] text-slate-500 font-normal">{info.row.original.email}</p>
                    </div>
                </div>
            ),
        }),
        columnHelper.accessor('roles', {
            header: () => (
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                    Access
                </span>
            ),
            cell: (info) => {
                const roleName = info.getValue()?.[0]?.name || 'Operator';
                return (
                    <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-tight">
                        {roleName}
                    </span>
                );
            },
        }),
        columnHelper.accessor('status', {
            header: 'Status',
            cell: (info) => {
                const status = info.row.original.status || 'active'; 
                const isInactive = status.toLowerCase() === 'inactive';

                return (
                    <div className="flex items-center gap-2">
                        <div className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
                            isInactive ? 'bg-slate-300' : 'bg-green-500 animate-pulse'
                        }`} />
                        
                        <span className="text-xs font-bold text-slate-500 capitalize">
                            {status}
                        </span>
                    </div>
                );
            },
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

            <UserForm 
                isOpen={isFormOpen} 
                onClose={() => setIsFormOpen(false)} 
                onSuccess={handleSuccess} 
                onError={handleError}
                selectedUser={selectedUser} 
            />

            <UserProfile
                isOpen={isViewOpen}
                onClose={() => setIsViewOpen(false)}
                title="User Details"
                data={selectedUser}
            />

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