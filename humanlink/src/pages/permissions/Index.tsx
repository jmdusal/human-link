import { useMemo, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { createColumnHelper } from "@tanstack/react-table";
import { Plus, MoreHorizontal, ShieldCheck, Eye, Pencil, Trash2, Clock } from 'lucide-react';
import { DataTable } from '@/components/Datatable';
// import ModalView from '../components/modal/ModalView';
import api from '@/api/axios';
import Button from '@/components/Button';
import PermissionForm from '@/pages/permissions/PermissionForm';
import ModalConfirmation from '@/components/modals/ModalConfirmation';
import TableActions from '@/components/TableActions';
import { useAuth } from '@/context/AuthContext';
import { API_ROUTES } from '@/constants';
import type { Permission } from '@/types/models';
import { useFormatDate } from '@/hooks/useFormatDate';

const columnHelper = createColumnHelper<Permission>();

export default function PermissionIndex() {
    const { can } = useAuth();
    const { formatDate } = useFormatDate();
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
    
    const [loading, setLoading] = useState(true);
    const [openDropdown, setOpenDropdown] = useState<number | null>(null);

    // const [isViewOpen, setIsViewOpen] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    
    useEffect(() => {
        api.get(API_ROUTES.PERMISSIONS.LIST)
           .then(res => setPermissions(res.data.data))
           .finally(() => setLoading(false));
    }, []);
    
    const handleAdd = () => {
        setSelectedPermission(null);
        setIsFormOpen(true);
    };

    const handleEdit = (permissions: Permission) => {
        setSelectedPermission(permissions);
        setIsFormOpen(true);
        setOpenDropdown(null);
    };   
    
    const handleView = (permission: Permission) => {
        setSelectedPermission(permission);
        // setIsViewOpen(true);
        setOpenDropdown(null);
    };

    const handleSuccess = (permissionData: Permission) => {
        if (selectedPermission) {
            setPermissions(prev => prev.map(u => u.id === permissionData.id ? permissionData : u));
            console.log("Permission updated successfully!");
        } else {
            setPermissions(prev => [permissionData, ...prev]);
            console.log("Permission created successfully!");
        }
    };

    const handleError = (error: any) => {
        console.error("Form Error:", error);
    };
    
    const handleDeleteClick = (permission: Permission) => {
        setSelectedPermission(permission);
        setIsDeleteModalOpen(true);
        setOpenDropdown(null);
    };
    
    const handleConfirmDelete = async () => {
        if (!selectedPermission) return;
        
        setIsDeleting(true);
        toast.promise(
            api.delete(API_ROUTES.PERMISSIONS.DELETE(selectedPermission.id)),
            {
                loading: 'Processing deletion...',
                success: () => {
                    setPermissions(prev => prev.filter(u => u.id !== selectedPermission.id));
                    setIsDeleteModalOpen(false);
                    return <b>Permission removed successfully.</b>;
                },
                error: (err) => {
                    console.error(err);
                    return <b>Failed to delete permission.</b>;
                },
            }
        ).finally(() => setIsDeleting(false));
    };
    
    const columns = useMemo(() => [
        columnHelper.accessor('name', {
            header: 'Permission Name',
            cell: (info) => (
                <div className="flex items-center gap-4">
                    <div>
                        <p className="font-medium text-slate-700 text-sm">{info.row.original.name}</p>
                    </div>
                </div>
            ),
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
                                show: can('permission-edit') 
                            },
                            { 
                                label: 'Delete', 
                                icon: Trash2, 
                                onClick: () => handleDeleteClick(info.row.original),
                                variant: 'danger',
                                show: can('permission-delete')
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
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Permission Management</h1>
                        <p className="text-slate-400 text-sm font-medium">System Access Control.</p>
                    </div>
                </div>

                {can('permission-create') && (
                    <Button variant="primary" icon={Plus} onClick={handleAdd}>Add Permission</Button>
                )}
            </div>

            <DataTable
                columns={columns}
                data={permissions}
                loading={loading}
                showSearch={true}
            />

            <PermissionForm 
                isOpen={isFormOpen} 
                onClose={() => setIsFormOpen(false)} 
                onSuccess={handleSuccess}
                onError={handleError}
                selectedPermission={selectedPermission} 
            />

            {/* <ModalView 
                isOpen={isViewOpen} 
                onClose={() => setIsViewOpen(false)} 
                title="User Details" 
                data={selectedPermission} 
            /> */}
            
            <ModalConfirmation 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                loading={isDeleting}
                title="Delete Permission"
                message={`Are you sure you want to delete ${selectedPermission?.name}? This action is permanent.`}
            />
        </div>
    );
}