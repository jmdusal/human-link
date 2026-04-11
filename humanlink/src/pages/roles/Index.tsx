import { useMemo, useState } from 'react';
import { createColumnHelper } from "@tanstack/react-table";
import { Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import RoleForm from '@/pages/roles/RoleForm';
import ModalConfirmation from '@/components/modals/ModalConfirmation';
import TableActions from '@/components/shared/TableActions';
import Button from '@/components/ui/Button';
import { DataTable } from '@/components/shared/Datatable';
import { useAuth } from '@/context/AuthContext';
import type { Role } from '@/types';
import { RoleService } from '@/services/RoleService';
import { useRoles } from '@/hooks/use-roles';
import { TextCell, DateCell, TagsCell } from '@/components/shared/TableCells';
import { AnimatePresence } from 'framer-motion';

const columnHelper = createColumnHelper<Role>();

export default function RoleIndex() {
    const { can } = useAuth();
    const { roles, setRoles, loading } = useRoles(true);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    
    const [openDropdown, setOpenDropdown] = useState<number | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    
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
            setRoles(prev => prev.map(r => r.id === roleData.id ? roleData : r));
        } else {
            setRoles(prev => [roleData, ...prev]);
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
        
        try {
            await RoleService.deleteRole(selectedRole.id);
            
            setRoles(prev => prev.filter(u => u.id !== selectedRole.id));
            toast.success('Role removed successfully.');
            setIsDeleteModalOpen(false);
        } catch (err: any) {
            console.error("Delete Error:", err);
        } finally {
            setIsDeleting(false);
            setSelectedRole(null);
        }
    };
    
    const columns = useMemo(() => [
        columnHelper.accessor('name', {
            header: 'Role Name',
            cell: (info) => <TextCell title={info.getValue()} />,
        }),
        columnHelper.accessor('permissions' as any, {
            header: 'Permissions',
            cell: (info) => <TagsCell tags={info.getValue()} emptyText="No permissions assigned" />
        }),
        columnHelper.accessor('createdAt', {
            header: 'Created',
            cell: (info) => <DateCell date={info.getValue()} />,   
        }),
        columnHelper.display({
            id: 'actions',
            size: 50,
            header: () => <div className="text-right">Actions</div>,
            cell: (info) => {
                return (
                    <TableActions
                        actions={[
                            {
                                label: 'Edit',
                                icon: Pencil,
                                onClick: () => handleEdit(info.row.original),
                                show: can('roles-edit')
                            },
                            {
                                label: 'Delete',
                                icon: Trash2,
                                onClick: () => handleDeleteClick(info.row.original),
                                variant: 'danger',
                                show: can('roles-delete')
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
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Role Management</h1>
                        <p className="text-slate-400 text-sm font-medium">System Access Control.</p>
                    </div>
                </div>

                {can('roles-create') && (
                    <Button variant="primary" icon={Plus} onClick={handleAdd}>New Role</Button>
                )}
            </div>

            <DataTable
                columns={columns}
                data={roles}
                loading={loading}
                showSearch={true}
            />
            
            <AnimatePresence>
                {isFormOpen && (
                    <RoleForm
                        key={selectedRole ? `edit-${selectedRole.id}` : 'create-role'}
                        isOpen={isFormOpen} 
                        onClose={() => setIsFormOpen(false)} 
                        onSuccess={handleSuccess}
                        onError={handleError}
                        selectedRole={selectedRole} 
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
                        title="Delete Role"
                        message={`Are you sure you want to delete ${selectedRole?.name}? This action is permanent.`}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}