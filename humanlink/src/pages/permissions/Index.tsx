import { useMemo, useState } from 'react';
import { createColumnHelper } from "@tanstack/react-table";
import { Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { DataTable } from '@/components/Datatable';
import Button from '@/components/Button';
import PermissionForm from '@/pages/permissions/PermissionForm';
import ModalConfirmation from '@/components/modals/ModalConfirmation';
import TableActions from '@/components/TableActions';
import { useAuth } from '@/context/AuthContext';
import type { Permission } from '@/types/models';
import { PermissionService } from '@/services/PermissionService';
import { usePermissions } from '@/hooks/usePermissions';
import { TextCell, DateCell } from '@/components/TableCells';

const columnHelper = createColumnHelper<Permission>();

export default function PermissionIndex() {
    const { can } = useAuth();
    const { permissions, setPermissions, loading,  } = usePermissions(true);
    
    const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
    
    const [openDropdown, setOpenDropdown] = useState<number | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    
    const handleAdd = () => {
        setSelectedPermission(null);
        setIsFormOpen(true);
    };

    const handleEdit = (permissions: Permission) => {
        setSelectedPermission(permissions);
        setIsFormOpen(true);
        setOpenDropdown(null);
    };

    const handleSuccess = (permissionData: Permission) => {
        if (selectedPermission) {
            setPermissions(prev => prev.map(permission => permission.id === permissionData.id ? permissionData : permission));
        } else {
            setPermissions(prev => [permissionData, ...prev]);
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
        
        try {
            await PermissionService.deletePermission(selectedPermission.id);
            
            setPermissions(prev => prev.filter(u => u.id !== selectedPermission.id));
            toast.success('Permission removed successfully.');
            setIsDeleteModalOpen(false);
        } catch (err: any) {
            console.error("Delete Error:", err);
        } finally {
            setIsDeleting(false);
            setSelectedPermission(null);
        }
    };
    
    const columns = useMemo(() => [
        columnHelper.accessor('name', {
            header: 'Permission Name',
            cell: (info) => <TextCell title={info.getValue()} />,
        }),
        columnHelper.accessor('createdAt', {
            header: 'Created',
            cell: (info) => <DateCell date={info.getValue()} />,
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
    ], [openDropdown, can]);

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
            
            {isFormOpen && (
                <PermissionForm
                    isOpen={isFormOpen} 
                    onClose={() => setIsFormOpen(false)} 
                    onSuccess={handleSuccess}
                    onError={handleError}
                    selectedPermission={selectedPermission} 
                />
            )}
            
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