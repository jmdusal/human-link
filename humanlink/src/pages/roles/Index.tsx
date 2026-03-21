import { useMemo, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { createColumnHelper } from "@tanstack/react-table";
import { Plus, MoreHorizontal, ShieldCheck, Pencil, Trash2, Clock } from 'lucide-react';
import api from '@/api/axios';
import RoleForm from '@/pages/roles/RoleForm';
import ModalConfirmation from '@/components/modals/ModalConfirmation';
import TableActions from '@/components/TableActions';
import Button from '@/components/Button';
import { DataTable } from '@/components/Datatable';
import { useAuth } from '@/context/AuthContext';
import type { Role } from '@/types/models';
import { API_ROUTES } from '@/constants';
import { useFormatDate } from '@/hooks/useFormatDate';

const columnHelper = createColumnHelper<Role>();

export default function RoleIndex() {
    const { can } = useAuth();
    const { formatDate } = useFormatDate();
    const [roles, setRoles] = useState<Role[]>([]);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [loading, setLoading] = useState(true);
    const [openDropdown, setOpenDropdown] = useState<number | null>(null);

    // const [isViewOpen, setIsViewOpen] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    
    useEffect(() => {
        api.get(API_ROUTES.ROLES.LIST)
           .then(res => setRoles(res.data.data))
           .finally(() => setLoading(false));
    }, []);
    
    const handleAdd = () => {
        setSelectedRole(null);
        setIsFormOpen(true);
    };

    const handleEdit = (role: Role) => {
        setSelectedRole(role);
        setIsFormOpen(true);
        setOpenDropdown(null);
    };
    
    const handleSuccess = (roleData: Role) => {
        if (selectedRole) {
            setRoles(prev => prev.map(u => u.id === roleData.id ? roleData : u));
            console.log("Role updated successfully!");
        } else {
            setRoles(prev => [roleData, ...prev]);
            console.log("Role created successfully!");
        }
    };

    const handleError = (error: any) => {
        const message = error?.response?.data?.message || error.message || "An error occurred";
        console.error("Form Error:", message);
    };
    
    const handleDeleteClick = (role: Role) => {
        setSelectedRole(role);
        setIsDeleteModalOpen(true);
        setOpenDropdown(null);
    };
    
    const handleConfirmDelete = async () => {
        if (!selectedRole) return;
        
        setIsDeleting(true);
        toast.promise(
            api.delete(API_ROUTES.ROLES.DELETE(selectedRole.id)),
            {
                loading: 'Processing deletion...',
                success: () => {
                    setRoles(prev => prev.filter(u => u.id !== selectedRole.id));
                    setIsDeleteModalOpen(false);
                    return <b>Role removed successfully.</b>;
                },
                error: (err) => {
                    console.error(err);
                    return <b>Failed to delete role.</b>;
                },
            }
        ).finally(() => setIsDeleting(false));
    };
    
    const columns = useMemo(() => [
        columnHelper.accessor('name', {
            header: 'Role Name',
            cell: (info) => (
                <div className="flex items-center gap-4">
                    <div>
                        <p className="font-medium text-slate-700 text-sm">{info.row.original.name}</p>
                    </div>
                </div>
                
            ),
        }),
        columnHelper.accessor('permissions' as any, {
            header: 'Permissions',
            cell: (info) => {
                const permissions = (info.row.original as any).permissions;
                return (
                    <div className="flex flex-wrap gap-1.5 py-1">
                        {permissions?.length > 0 ? (
                            permissions.map((p: any) => (
                                <span 
                                    key={p.id} 
                                    className="px-2 py-0.5 text-[10px] font-semibold text-slate-500 bg-slate-50/50 border border-slate-200/60 rounded-md tracking-tight hover:bg-slate-100 transition-colors"
                                >
                                    {p.name.replace('-', ' ')} 
                                </span>
                            ))
                        ) : (
                            <span className="text-[11px] text-slate-300 italic">No permissions assigned</span>
                        )}
                    </div>
                );
            }
        }),
        columnHelper.accessor('createdAt', {
            header: 'Created',
            cell: (info) => (
                <div className="flex items-center gap-2">
                    <Clock size={12} className="text-slate-300" />
                    <span className="text-xs font-bold text-slate-500">
                        {formatDate(info.row.original.createdAt)}
                    </span>
                </div>
            ),
        }),
        columnHelper.display({
            id: 'actions',
            cell: (info) => {
                return (
                    <TableActions
                        actions={[
                            {
                                label: 'Edit',
                                icon: Pencil,
                                onClick: () => handleEdit(info.row.original),
                                show: can('role-edit')
                            },
                            {
                                label: 'Delete',
                                icon: Trash2,
                                onClick: () => handleDeleteClick(info.row.original),
                                variant: 'danger',
                                show: can('role-delete')
                            },
                        ]}
                    />
                );
            },
        }),
    ], [openDropdown, can, formatDate]);

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Role Management</h1>
                        <p className="text-slate-400 text-sm font-medium">System Access Control.</p>
                    </div>
                </div>

                {can('role-create') && (
                    <Button variant="primary" icon={Plus} onClick={handleAdd}>Add Role</Button>
                )}
            </div>

            <DataTable
                columns={columns}
                data={roles}
                loading={loading}
                showSearch={true}
            />

            <RoleForm
                isOpen={isFormOpen} 
                onClose={() => setIsFormOpen(false)} 
                onSuccess={handleSuccess}
                onError={handleError}
                selectedRole={selectedRole} 
            />

            <ModalConfirmation 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                loading={isDeleting}
                title="Delete Role"
                message={`Are you sure you want to delete ${selectedRole?.name}? This action is permanent.`}
            />
        </div>
    );
}