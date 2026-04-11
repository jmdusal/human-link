import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { createColumnHelper } from "@tanstack/react-table";
import { Plus, Pencil, Trash2, PieChart, History as LucideHistory, Eye } from 'lucide-react';
import { DataTable } from '@/components/shared/Datatable';
import Button from '@/components/ui/Button';
import LeaveBalanceForm from '@/pages/leave-balances/LeaveBalanceForm';
import ModalConfirmation from '@/components/modals/ModalConfirmation';
import TableActions from '@/components/shared/TableActions';
import { useAuth } from '@/context/AuthContext';
import type { LeaveBalance, GroupedLeaveBalance } from '@/types';
import { LeaveBalanceService } from '@/services/LeaveBalanceService';
import { useLeaveBalances } from '@/hooks/use-leave-balances';
import { TextCell, DateCell, UserCell } from '@/components/shared/TableCells';
import LeaveBalancesOverviewModal from '@/components/modals/leave-balances/LeaveBalancesOverviewModal'
import { AnimatePresence } from 'framer-motion';

const columnHelper = createColumnHelper<GroupedLeaveBalance>();

export default function LeavePolicyIndex() {
    const { can } = useAuth();
    const { leavebalances, setLeaveBalances, loading,  } = useLeaveBalances(true);
    // const [selectedBalance, setSelectedBalance] = useState<LeaveBalance | GroupedLeaveBalance | null>(null);
    const [selectedBalance, setSelectedBalance] = useState<GroupedLeaveBalance | null>(null);
    
    const [selectedLeaveBalance, setSelectedLeaveBalance] = useState<LeaveBalance | null>(null);

    const [openDropdown, setOpenDropdown] = useState<number | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditFormOpen, setIsEditFormOpen] = useState(false);
    
    const groupedData = useMemo(() => {
        const groups: Record<number, GroupedLeaveBalance> = {};
        leavebalances.forEach((item) => {
            if (!groups[item.userId]) {
                groups[item.userId] = {
                    userId: item.userId,
                    userName: item.user?.name || 'Unknown',
                    userEmail: item.user?.email || '',
                    totalAllowed: 0,
                    totalUsed: 0,
                    totalRemaining: 0,
                    policies: []
                };
            }
            groups[item.userId].totalAllowed += Number(item.allowed);
            groups[item.userId].totalUsed += Number(item.used);
            groups[item.userId].totalRemaining += item.remaining;
            groups[item.userId].policies.push(item);
        });
        return Object.values(groups);
    }, [leavebalances]);
    
    const handleAdd = () => {
        setSelectedLeaveBalance(null);
        setIsFormOpen(true);
    };
    
    const handleView = (group: GroupedLeaveBalance) => {
        setSelectedBalance(group);
        setIsViewModalOpen(true);
        setOpenDropdown(null);
    };

    // const handleEdit = (group: GroupedLeaveBalance) => {
    //     // const policyToEdit = group.policies[0]; 
    //     // setSelectedLeaveBalance(policyToEdit);
    //     setSelectedBalance(group);
    //     setIsEditFormOpen(true);
    //     setIsFormOpen(true);
    //     setOpenDropdown(null);
    // };  
    
    const handleSuccess = (balanceData: LeaveBalance) => {
        if (selectedLeaveBalance) {
            setLeaveBalances(prev => prev.map(balance => balance.id === balanceData.id ? balanceData : balance));
        } else {
            setLeaveBalances(prev => [balanceData, ...prev]);
        }
    };

    const handleError = (error: any) => {
        console.error("Form Error:", error);
    };
    
    const handleDeleteClick = (group: GroupedLeaveBalance) => {
        setSelectedBalance(group);
        setIsDeleteModalOpen(true);
        setOpenDropdown(null);
    };
    
    const handleConfirmDelete = async () => {
        const balanceToDelete = (selectedBalance as GroupedLeaveBalance)?.policies[0];
        if (!balanceToDelete) return;

        setIsDeleting(true);
        try {
            await LeaveBalanceService.deleteBalance(balanceToDelete.id);
            setLeaveBalances(prev => prev.filter(b => b.id !== balanceToDelete.id));
            toast.success('Balance removed.');
            setIsDeleteModalOpen(false);
        } finally {
            setIsDeleting(false);
            setSelectedBalance(null);
        }
    };

    const columns = useMemo(() => [
        columnHelper.accessor('userName', {
            header: 'User Identity',
            cell: (info) => (
                <UserCell
                    name={info.getValue()} 
                    email={info.row.original.userEmail} 
                />
            ),
        }),
        
        columnHelper.accessor('totalRemaining', {
            header: 'Total Remaining',
            cell: (info) => <TextCell title={info.getValue()} />,
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
                                label: 'View Breakdown',
                                icon: Eye,
                                onClick: () => handleView(info.row.original),
                                show: can('leave-balances-edit')
                            },
                            // {
                            //     label: 'Edit',
                            //     icon: Pencil,
                            //     onClick: () => handleEdit(info.row.original),
                            //     show: can('leave-balance-edit')
                            // },
                            {
                                label: 'Delete',
                                icon: Trash2,
                                onClick: () => handleDeleteClick(info.row.original),
                                variant: 'danger',
                                show: can('leave-balances-delete')
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
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Leave Balance</h1>
                        <p className="text-slate-400 text-sm font-medium">Monitor and adjust available leave credits for the current year.</p>
                    </div>
                </div>

                {can('leave-balances-create') && (
                    <Button variant="primary" icon={Plus} onClick={handleAdd}>New Balance</Button>
                )}
            </div>

            <DataTable
                columns={columns}
                data={groupedData}
                // data={leavebalances}
                loading={loading}
                showSearch={true}
            />
            
             <AnimatePresence>
                {isEditFormOpen && (
                    <LeaveBalanceForm
                        key={selectedLeaveBalance ? `edit-${selectedLeaveBalance.id}` : 'create-balance'}
                        isOpen={isEditFormOpen} 
                        onClose={() => {
                            setIsEditFormOpen(false);
                            setSelectedBalance(null);
                        }} 
                        onSuccess={handleSuccess}
                        onError={handleError}
                        selectedLeaveBalance={selectedLeaveBalance} 
                    />
                )}
             </AnimatePresence>
             

            {/* {isFormOpen && (
                <LeaveBalanceForm
                    isOpen={isFormOpen} 
                    onClose={() => setIsFormOpen(false)} 
                    onSuccess={handleSuccess}
                    onError={handleError}
                    selectedLeaveBalance={selectedLeaveBalance} 
                />
            )} */}
            
            <AnimatePresence>
                <LeaveBalancesOverviewModal
                    // isOpen={isFormOpen && selectedBalance !== null}
                    isOpen={isViewModalOpen}
                    onClose={() => {
                        setIsViewModalOpen(false);  
                        setSelectedBalance(null);
                    }}
                    title="Leave Balances Overview"
                    data={selectedBalance}
                />
            </AnimatePresence>
            
            <AnimatePresence>
                {isDeleteModalOpen && (
                    <ModalConfirmation
                        key="delete-confirmation"
                        isOpen={isDeleteModalOpen}
                        onClose={() => setIsDeleteModalOpen(false)}
                        onConfirm={handleConfirmDelete}
                        loading={isDeleting}
                        title="Delete Balance"
                        message={`Are you sure you want to delete ${selectedLeaveBalance?.user}? This action is permanent.`}
                    />
                )}
            </AnimatePresence>
            
        </div>
    );
}