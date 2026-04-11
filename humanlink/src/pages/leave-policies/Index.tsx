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
import { TextCell, DateCell } from '@/components/shared/TableCells';
import { AnimatePresence } from 'framer-motion';

const columnHelper = createColumnHelper<LeavePolicy>();

export default function LeavePolicyIndex() {
// export default function LeavePolicyIndex({ initialData, onRefresh }: LeavePolicyIndexProps) {
    const { can } = useAuth();
    const { leavepolicies, setLeavePolicies, loading,  } = useLeavePolicies(true);

    const [selectedLeavePolicy, setSelectedLeavePolicy] = useState<LeavePolicy | null>(null);
    
    // const [loading, setLoading] = useState(true);
    const [openDropdown, setOpenDropdown] = useState<number | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    
    // useEffect(() => {
    //     api.get(API_ROUTES.LEAVE_POLICIES.LIST)
    //        .then(res => setLeavePolicies(res.data.data))
    //        .finally(() => setLoading(false));
    // }, []);
    
    const handleAdd = () => {
        setSelectedLeavePolicy(null);
        setIsFormOpen(true);
    };

    const handleEdit = (leavepolicies: LeavePolicy) => {
        setSelectedLeavePolicy(leavepolicies);
        setIsFormOpen(true);
        setOpenDropdown(null);
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
        setOpenDropdown(null);
    };
    
    const handleConfirmDelete = async () => {
        if (!selectedLeavePolicy) return;
        setIsDeleting(true);
        
        try {
            await LeavePolicyService.deletePolicy(selectedLeavePolicy.id);
            
            setLeavePolicies(prev => prev.filter(u => u.id !== selectedLeavePolicy.id));
            toast.success('Policy removed successfully.');
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
            header: 'Policy Name',
            cell: (info) => <TextCell title={info.getValue()} />,
        }),
        columnHelper.accessor('defaultCredits', {
            header: 'Credits',
            cell: (info) => <TextCell title={info.getValue()} />,
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
    ], [openDropdown, can]);

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Leave Policy Management</h1>
                        <p className="text-slate-400 text-sm font-medium">Configure leave types, accruals, and policies.</p>
                    </div>
                </div>

                {can('leave-policies-create') && (
                    <Button variant="primary" icon={Plus} onClick={handleAdd}>New Policy</Button>
                )}
            </div>

            <DataTable
                columns={columns}
                data={leavepolicies}
                loading={loading}
                showSearch={true}
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
                        title="Delete Policy"
                        message={`Are you sure you want to delete ${selectedLeavePolicy?.name}? This action is permanent.`}
                    />
                )}
            </AnimatePresence>
            
        </div>
    );
}