import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { createColumnHelper } from "@tanstack/react-table";
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { DataTable } from '@/components/shared/Datatable';
import Button from '@/components/ui/Button';
import LeavePolicyForm from '@/pages/leave-policies/LeavePolicyForm';
import ModalConfirmation from '@/components/modals/ModalConfirmation';
import TableActions from '@/components/shared/TableActions';
import { useAuth } from '@/context/AuthContext';
import type { LeavePolicy } from '@/types';
import { LeavePolicyService } from '@/services/LeavePolicyService';
import { useLeavePolicies } from '@/hooks/use-leave-policies';
import { TextCell, StatusBadge, DateCell } from '@/components/shared/TableCells';
import { AnimatePresence } from 'framer-motion';

const columnHelper = createColumnHelper<LeavePolicy>();

export default function LeavePolicyIndex() {
    const { can } = useAuth();
    const { leavepolicies, setLeavePolicies, loading,  } = useLeavePolicies(true);

    const [selectedLeavePolicy, setSelectedLeavePolicy] = useState<LeavePolicy | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    
    const handleAdd = () => {
        setSelectedLeavePolicy(null);
        setIsFormOpen(true);
    };

    const handleEdit = (leavepolicies: LeavePolicy) => {
        setSelectedLeavePolicy(leavepolicies);
        setIsFormOpen(true);
    };   
    
    const handleSuccess = (policyData: LeavePolicy) => {
        if (selectedLeavePolicy) {
            setLeavePolicies(prev => prev.map(policy => policy.id === policyData.id ? policyData : policy));
        } else {
            setLeavePolicies(prev => [policyData, ...prev]);
        }
    };

    const handleError = (error: any) => {
        console.error("Form Error:", error);
    };
    
    const handleDeleteClick = (leavepolicy: LeavePolicy) => {
        setSelectedLeavePolicy(leavepolicy);
        setIsDeleteModalOpen(true);
    };
    
    const handleConfirmDelete = async () => {
        if (!selectedLeavePolicy) return;
        setIsDeleting(true);
        
        try {
            await LeavePolicyService.deletePolicy(selectedLeavePolicy.id);
            
            setLeavePolicies(prev => prev.filter(u => u.id !== selectedLeavePolicy.id));
            toast.success('Leave type removed successfully.');
            setIsDeleteModalOpen(false);
        } catch (err: any) {
            console.error("Delete Error:", err);
        } finally {
            setIsDeleting(false);
            setSelectedLeavePolicy(null);
        }
    };
    
    const columns = useMemo(() => [
        columnHelper.accessor('name', {
            header: 'Type',
            cell: (info) => (
                <div className="flex flex-col min-w-0">
                    <TextCell title={info.getValue()} />
                    <span className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                        {info.row.original.slug}
                    </span>
                </div>
            ),
        }),
        columnHelper.accessor('defaultCredits', {
            header: 'Credits',
            cell: (info) => <TextCell title={info.getValue()} />,
        }),
        columnHelper.accessor('isPaid', {
            header: 'Paid',
            cell: (info) => (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                    info.getValue()
                        ? 'bg-emerald-50/50 text-emerald-600 border-emerald-100/50'
                        : 'bg-slate-50 text-slate-400 border-slate-100'
                }`}>
                    {info.getValue() ? 'Paid' : 'Unpaid'}
                </span>
            ),
        }),
        columnHelper.accessor('isActive', {
            header: 'Active',
            cell: (info) => (
                <StatusBadge status={info.getValue() ? 'active' : 'inactive'} />
            ),
        }),
        columnHelper.accessor('createdAt', {
            header: 'Created',
            cell: (info) => <DateCell date={info.getValue()} dateOnly />,
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
                                show: can('leave-policies-edit')
                            },
                            {
                                label: 'Delete',
                                icon: Trash2,
                                onClick: () => handleDeleteClick(info.row.original),
                                variant: 'danger',
                                show: can('leave-policies-delete')
                            },
                        ]}
                    />
                );
            },
        }),
    ], [can]);

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Leave Types</h1>
                        <p className="text-slate-400 text-sm font-medium">Define leave categories and their rules.</p>
                    </div>
                </div>

                {can('leave-policies-create') && (
                    <Button variant="primary" icon={Plus} onClick={handleAdd}>New Leave Type</Button>
                )}
            </div>

            <DataTable
                columns={columns}
                data={leavepolicies}
                loading={loading}
                showSearch={true}
                countLabel={`${leavepolicies.length} ${leavepolicies.length === 1 ? 'type' : 'types'}`}
            />

            <AnimatePresence>
                {isFormOpen && (
                    <LeavePolicyForm
                        key={selectedLeavePolicy ? `edit-${selectedLeavePolicy.id}` : 'create-policy'}
                        isOpen={isFormOpen} 
                        onClose={() => setIsFormOpen(false)} 
                        onSuccess={handleSuccess}
                        onError={handleError}
                        selectedLeavePolicy={selectedLeavePolicy} 
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
                        title="Delete Leave Type"
                        message={`Are you sure you want to delete ${selectedLeavePolicy?.name}? This action is permanent.`}
                    />
                )}
            </AnimatePresence>
            
        </div>
    );
}