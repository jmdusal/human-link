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
            header: 'User Identity',
            cell: (info) => (
                <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 ${info.row.original.color || 'bg-slate-500'} rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-slate-100`}>
                        {info.getValue().charAt(0)}
                    </div>
                    <div>
                        <p className="font-bold text-slate-800 text-sm">{info.getValue()}</p>
                        <p className="text-[11px] text-slate-400 font-medium">{info.row.original.email}</p>
                    </div>
                </div>
            ),
        }),
        columnHelper.accessor('roles', {
            header: 'Access Level',
            cell: (info) => {
                const roles = info.getValue() || [];
                const roleName = roles.length > 0 ? roles[0].name : 'Operator';
                
                return (
                    <div className="flex items-center gap-2 bg-slate-50 w-fit px-3 py-1 rounded-full border border-slate-100">
                        <Shield size={12} className="text-blue-600" />
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">
                            {roleName}
                        </span>
                    </div>
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
            cell: (info) => (
                <div className="text-right relative px-6">
                    <button
                        onClick={() => setOpenDropdown(openDropdown === info.row.original.id ? null : info.row.original.id)}
                        className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer border-none bg-transparent"
                    >
                        <MoreHorizontal size={20} />
                    </button>
                    
                    {openDropdown === info.row.original.id && (
                        <>
                            <div className="fixed inset-0 z-20" onClick={() => setOpenDropdown(null)}></div>
                            <div className="absolute right-8 bottom-full mb-2 w-44 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border border-slate-100 z-30 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                <div className="py-2">
                                    <button
                                        onClick={() => handleView(info.row.original)}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-colors border-none bg-transparent cursor-pointer"
                                    >
                                        <Eye size={14} className="text-blue-500" /> Show/View
                                    </button>
                                    
                                    {can('user-edit') && (
                                        <button 
                                            onClick={() => handleEdit(info.row.original)}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-colors border-none bg-transparent cursor-pointer"
                                        >
                                            <Pencil size={14} className="text-amber-500" /> Edit
                                        </button>
                                    )}
                                    
                                    {can('user-delete') && (
                                        <button
                                            onClick={() => handleDeleteClick(info.row.original)}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold text-red-500 hover:bg-red-50 transition-colors border-none bg-transparent cursor-pointer"
                                        >
                                            <Trash2 size={14} /> Delete
                                        </button>
                                    )}
                                    
                                </div>
                            </div>
                        </>
                    )}
                </div>
            ),
        }),
    ], [openDropdown, can]);

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 text-slate-600">
                        <User2Icon size={24} className="text-blue-600" />
                    </div>
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