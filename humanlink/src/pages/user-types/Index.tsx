import { useMemo, useState } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import UserTypeForm from '@/pages/user-types/UserTypeForm';
import ModalConfirmation from '@/components/modals/ModalConfirmation';
import TableActions from '@/components/shared/TableActions';
import Button from '@/components/ui/Button';
import { DataTable } from '@/components/shared/Datatable';
import { TextCell, TagsCell } from '@/components/shared/TableCells';
import { useAuth } from '@/context/AuthContext';
import { useUserTypes } from '@/hooks/use-user-types';
import { UserTypeService } from '@/services/UserTypeService';
import type { UserTypeRecord } from '@/types/UserTypeRecord';
import { accessScopeLabel } from '@/utils/userTypeUtils';

const columnHelper = createColumnHelper<UserTypeRecord>();

export default function UserTypeIndex() {
    const { can } = useAuth();
    const { userTypes, setUserTypes, loading } = useUserTypes(true);
    const [selectedUserType, setSelectedUserType] = useState<UserTypeRecord | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleAdd = () => {
        setSelectedUserType(null);
        setIsFormOpen(true);
    };

    const handleEdit = (userType: UserTypeRecord) => {
        setSelectedUserType(userType);
        setIsFormOpen(true);
    };

    const handleSuccess = (userTypeData: UserTypeRecord) => {
        if (selectedUserType) {
            setUserTypes((prev) =>
                prev.map((item) => (item.id === userTypeData.id ? userTypeData : item))
            );
        } else {
            setUserTypes((prev) => [userTypeData, ...prev]);
        }
    };

    const handleError = (error: any) => {
        const message = error?.response?.data?.message || error.message || 'An error occurred';
        console.error('Form Error:', message);
    };

    const handleDeleteClick = (userType: UserTypeRecord) => {
        setSelectedUserType(userType);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedUserType) return;
        setIsDeleting(true);

        try {
            await UserTypeService.deleteUserType(selectedUserType.id);
            setUserTypes((prev) => prev.filter((item) => item.id !== selectedUserType.id));
            toast.success('User type removed successfully.');
            setIsDeleteModalOpen(false);
        } catch (err: any) {
            console.error('Delete Error:', err);
            toast.error(err?.response?.data?.message || 'Failed to delete user type.');
        } finally {
            setIsDeleting(false);
            setSelectedUserType(null);
        }
    };

    const columns = useMemo(
        () => [
            columnHelper.accessor('name', {
                header: 'User type',
                cell: (info) => (
                    <TextCell
                        title={`${info.getValue()}${info.row.original.isSystem ? ' (system)' : ''}`}
                    />
                ),
            }),
            columnHelper.accessor('accessScope', {
                header: 'Data scope',
                cell: (info) => <TextCell title={accessScopeLabel(info.getValue())} />,
            }),
            columnHelper.accessor('permissions' as any, {
                header: 'Permissions',
                cell: (info) => (
                    <TagsCell tags={info.getValue()} emptyText="No permissions assigned" />
                ),
            }),
            columnHelper.accessor('usersCount', {
                header: 'Users',
                cell: (info) => <TextCell title={String(info.getValue() ?? 0)} />,
            }),
            columnHelper.display({
                id: 'actions',
                size: 50,
                header: () => <div className="text-right">Actions</div>,
                cell: (info) => {
                    const userType = info.row.original;

                    return (
                        <TableActions
                            actions={[
                                {
                                    label: 'Edit',
                                    icon: Pencil,
                                    onClick: () => handleEdit(userType),
                                    show: can('user-types-edit'),
                                },
                                {
                                    label: 'Delete',
                                    icon: Trash2,
                                    onClick: () => handleDeleteClick(userType),
                                    variant: 'danger',
                                    show: can('user-types-delete') && !userType.isSystem,
                                },
                            ]}
                        />
                    );
                },
            }),
        ],
        [can]
    );

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                            User Types
                        </h1>
                        <p className="text-slate-400 text-sm font-medium">
                            Company access packs — permissions + data scope.
                        </p>
                    </div>
                </div>

                {can('user-types-create') && (
                    <Button variant="primary" icon={Plus} onClick={handleAdd}>
                        New User Type
                    </Button>
                )}
            </div>

            <DataTable
                columns={columns}
                data={userTypes}
                loading={loading}
                showSearch={true}
                countLabel={`${userTypes.length} ${userTypes.length === 1 ? 'type' : 'types'}`}
            />

            <AnimatePresence>
                {isFormOpen && (
                    <UserTypeForm
                        key={selectedUserType ? `edit-${selectedUserType.id}` : 'create-user-type'}
                        isOpen={isFormOpen}
                        onClose={() => setIsFormOpen(false)}
                        onSuccess={handleSuccess}
                        onError={handleError}
                        selectedUserType={selectedUserType}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isDeleteModalOpen && (
                    <ModalConfirmation
                        key="delete-user-type-confirmation"
                        isOpen={isDeleteModalOpen}
                        onClose={() => setIsDeleteModalOpen(false)}
                        onConfirm={handleConfirmDelete}
                        loading={isDeleting}
                        title="Delete User Type"
                        message={`Are you sure you want to delete ${selectedUserType?.name}? This action is permanent.`}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
