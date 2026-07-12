import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { createColumnHelper } from '@tanstack/react-table';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { DataTable } from '@/components/shared/Datatable';
import Button from '@/components/ui/Button';
import DepartmentForm from '@/pages/departments/DepartmentForm';
import ModalConfirmation from '@/components/modals/ModalConfirmation';
import DepartmentJobsModal from '@/components/modals/departments/DepartmentJobsModal';
import TableActions from '@/components/shared/TableActions';
import { TextCell, StatusBadge } from '@/components/shared/TableCells';
import { useAuth } from '@/context/AuthContext';
import { useDepartments } from '@/hooks/use-departments';
import { DepartmentService } from '@/services/DepartmentService';
import type { Department } from '@/types';

const columnHelper = createColumnHelper<Department>();

export default function DepartmentIndex() {
    const { can } = useAuth();
    const { departments, setDepartments, loading } = useDepartments(true);

    const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
    const [viewDepartment, setViewDepartment] = useState<Department | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleAdd = () => {
        setSelectedDepartment(null);
        setIsFormOpen(true);
    };

    const handleView = (department: Department) => {
        setViewDepartment(department);
        setIsViewOpen(true);
    };

    const handleEdit = (department: Department) => {
        setSelectedDepartment(department);
        setIsFormOpen(true);
    };

    const handleSuccess = (departmentData: Department) => {
        if (selectedDepartment) {
            setDepartments((prev) =>
                prev.map((row) => (row.id === departmentData.id ? departmentData : row))
            );
        } else {
            setDepartments((prev) => [departmentData, ...prev]);
        }
    };

    const handleError = (error: unknown) => {
        console.error('Form Error:', error);
    };

    const handleDeleteClick = (department: Department) => {
        setSelectedDepartment(department);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedDepartment) return;
        setIsDeleting(true);

        try {
            await DepartmentService.deleteDepartment(selectedDepartment.id);
            setDepartments((prev) => prev.filter((row) => row.id !== selectedDepartment.id));
            toast.success('Department removed successfully.');
            setIsDeleteModalOpen(false);
        } catch (err) {
            console.error('Delete Error:', err);
        } finally {
            setIsDeleting(false);
            setSelectedDepartment(null);
        }
    };

    const columns = useMemo(
        () => [
            columnHelper.accessor('name', {
                header: 'Department',
                cell: (info) => (
                    <div className="flex min-w-0 flex-col">
                        <TextCell title={info.getValue()} />
                        <span className="mt-0.5 truncate text-[11px] font-medium text-slate-400">
                            {info.row.original.slug}
                        </span>
                    </div>
                ),
            }),
            columnHelper.accessor('positionsCount', {
                header: 'Jobs',
                cell: (info) => <TextCell title={String(info.getValue() ?? 0)} />,
            }),
            columnHelper.accessor('isActive', {
                header: 'Active',
                cell: (info) => (
                    <StatusBadge status={info.getValue() ? 'active' : 'inactive'} />
                ),
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
                            },
                            {
                                label: 'Edit',
                                icon: Pencil,
                                onClick: () => handleEdit(info.row.original),
                                show: can('departments-edit'),
                            },
                            {
                                label: 'Delete',
                                icon: Trash2,
                                onClick: () => handleDeleteClick(info.row.original),
                                variant: 'danger',
                                show: can('departments-delete'),
                            },
                        ]}
                    />
                ),
            }),
        ],
        [can]
    );

    return (
        <div className="w-full">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-800">Departments</h1>
                    <p className="text-sm font-medium text-slate-400">
                        Organize teams and assign jobs under each department.
                    </p>
                </div>

                {can('departments-create') && (
                    <Button variant="primary" icon={Plus} onClick={handleAdd}>
                        New Department
                    </Button>
                )}
            </div>

            <DataTable
                columns={columns}
                data={departments}
                loading={loading}
                showSearch={true}
                countLabel={`${departments.length} ${departments.length === 1 ? 'department' : 'departments'}`}
                onRowClick={handleView}
            />

            <AnimatePresence>
                {isViewOpen && (
                    <DepartmentJobsModal
                        key={viewDepartment ? `view-${viewDepartment.id}` : 'view-department'}
                        isOpen={isViewOpen}
                        onClose={() => {
                            setIsViewOpen(false);
                            setViewDepartment(null);
                        }}
                        department={viewDepartment}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isFormOpen && (
                    <DepartmentForm
                        key={selectedDepartment ? `edit-${selectedDepartment.id}` : 'create-department'}
                        isOpen={isFormOpen}
                        onClose={() => setIsFormOpen(false)}
                        onSuccess={handleSuccess}
                        onError={handleError}
                        selectedDepartment={selectedDepartment}
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
                        title="Delete Department"
                        message={`Are you sure you want to delete ${selectedDepartment?.name}? This action is permanent.`}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
