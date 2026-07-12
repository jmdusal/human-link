import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { createColumnHelper } from '@tanstack/react-table';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { DataTable } from '@/components/shared/Datatable';
import Button from '@/components/ui/Button';
import JobForm from '@/pages/jobs/JobForm';
import ModalConfirmation from '@/components/modals/ModalConfirmation';
import TableActions from '@/components/shared/TableActions';
import { TextCell, StatusBadge } from '@/components/shared/TableCells';
import { useAuth } from '@/context/AuthContext';
import { usePositions } from '@/hooks/use-positions';
import { PositionService } from '@/services/PositionService';
import type { Position } from '@/types';

const columnHelper = createColumnHelper<Position>();

export default function JobIndex() {
    const { can } = useAuth();
    const { positions, setPositions, loading } = usePositions(true);

    const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleAdd = () => {
        setSelectedPosition(null);
        setIsFormOpen(true);
    };

    const handleEdit = (position: Position) => {
        setSelectedPosition(position);
        setIsFormOpen(true);
    };

    const handleSuccess = (positionData: Position) => {
        if (selectedPosition) {
            setPositions((prev) =>
                prev.map((row) => (row.id === positionData.id ? positionData : row))
            );
        } else {
            setPositions((prev) => [positionData, ...prev]);
        }
    };

    const handleError = (error: unknown) => {
        console.error('Form Error:', error);
    };

    const handleDeleteClick = (position: Position) => {
        setSelectedPosition(position);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedPosition) return;
        setIsDeleting(true);

        try {
            await PositionService.deletePosition(selectedPosition.id);
            setPositions((prev) => prev.filter((row) => row.id !== selectedPosition.id));
            toast.success('Job removed successfully.');
            setIsDeleteModalOpen(false);
        } catch (err) {
            console.error('Delete Error:', err);
        } finally {
            setIsDeleting(false);
            setSelectedPosition(null);
        }
    };

    const columns = useMemo(
        () => [
            columnHelper.accessor('name', {
                header: 'Job',
                cell: (info) => (
                    <div className="flex flex-col min-w-0">
                        <TextCell title={info.getValue()} />
                        <span className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                            {info.row.original.slug}
                        </span>
                    </div>
                ),
            }),
            columnHelper.accessor((row) => row.department?.name ?? '', {
                id: 'department',
                header: 'Department',
                cell: (info) => <TextCell title={info.getValue() || '—'} />,
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
                                label: 'Edit',
                                icon: Pencil,
                                onClick: () => handleEdit(info.row.original),
                                show: can('positions-edit'),
                            },
                            {
                                label: 'Delete',
                                icon: Trash2,
                                onClick: () => handleDeleteClick(info.row.original),
                                variant: 'danger',
                                show: can('positions-delete'),
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
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Jobs</h1>
                    <p className="text-slate-400 text-sm font-medium">
                        Define job titles per department for user assignment.
                    </p>
                </div>

                {can('positions-create') && (
                    <Button variant="primary" icon={Plus} onClick={handleAdd}>
                        New Job
                    </Button>
                )}
            </div>

            <DataTable
                columns={columns}
                data={positions}
                loading={loading}
                showSearch={true}
                countLabel={`${positions.length} ${positions.length === 1 ? 'job' : 'jobs'}`}
            />

            <AnimatePresence>
                {isFormOpen && (
                    <JobForm
                        key={selectedPosition ? `edit-${selectedPosition.id}` : 'create-job'}
                        isOpen={isFormOpen}
                        onClose={() => setIsFormOpen(false)}
                        onSuccess={handleSuccess}
                        onError={handleError}
                        selectedPosition={selectedPosition}
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
                        title="Delete Job"
                        message={`Are you sure you want to delete ${selectedPosition?.name}? This action is permanent.`}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
