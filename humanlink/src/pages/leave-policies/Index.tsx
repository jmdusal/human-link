import { useMemo, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { createColumnHelper } from "@tanstack/react-table";
import { Plus, MoreHorizontal, Eye, Pencil, Trash2, Clock, CalendarDays } from 'lucide-react';
import { DataTable } from '@/components/Datatable';
import api from '@/api/axios';
import Button from '@/components/Button';
import LeavePolicyForm from '@/pages/leave-policies/LeavePolicyForm';
import ModalConfirmation from '@/components/modals/ModalConfirmation';
import TableActions from '@/components/TableActions';
import { useAuth } from '@/context/AuthContext';
import { API_ROUTES } from '@/constants';
import type { LeavePolicy } from '@/types/models';
import { useFormatDate } from '@/hooks/useFormatDate';

const columnHelper = createColumnHelper<LeavePolicy>();

export default function LeavePolicyIndex() {
    const { can } = useAuth();
    const { formatDate } = useFormatDate();
    
    const [leavepolicies, setLeavePolicies] = useState<LeavePolicy[]>([]);
    const [selectedLeavePolicy, setSelectedLeavePolicy] = useState<LeavePolicy | null>(null);
    
    const [loading, setLoading] = useState(true);
    const [openDropdown, setOpenDropdown] = useState<number | null>(null);

    // const [isViewOpen, setIsViewOpen] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    
    useEffect(() => {
        api.get(API_ROUTES.LEAVE_POLICIES.LIST)
           .then(res => setLeavePolicies(res.data.data))
           .finally(() => setLoading(false));
    }, []);
    
    const handleAdd = () => {
        setSelectedLeavePolicy(null);
        setIsFormOpen(true);
    };

    const handleEdit = (leavepolicies: LeavePolicy) => {
        setSelectedLeavePolicy(leavepolicies);
        setIsFormOpen(true);
        setOpenDropdown(null);
    };   
    
    // const handleView = (leavepolicy: LeavePolicy) => {
    //     setSelectedLeavePolicy(leavepolicy);
    //     // setIsViewOpen(true);
    //     setOpenDropdown(null);
    // };

    const handleSuccess = (policyData: LeavePolicy) => {
        if (selectedLeavePolicy) {
            setLeavePolicies(prev => prev.map(u => u.id === policyData.id ? policyData : u));
            console.log("Policy updated successfully!");
        } else {
            setLeavePolicies(prev => [policyData, ...prev]);
            console.log("Policy created successfully!");
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
        toast.promise(
            api.delete(API_ROUTES.LEAVE_POLICIES.DELETE(selectedLeavePolicy.id)),
            {
                loading: 'Processing deletion...',
                success: () => {
                    setLeavePolicies(prev => prev.filter(u => u.id !== selectedLeavePolicy.id));
                    setIsDeleteModalOpen(false);
                    return <b>Policy removed successfully.</b>;
                },
                error: (err) => {
                    console.error(err);
                    return <b>Failed to delete policy.</b>;
                },
            }
        ).finally(() => setIsDeleting(false));
    };
    
    const columns = useMemo(() => [
        columnHelper.accessor('name', {
            header: 'Policy Name',
            cell: (info) => (
                <div className="flex items-center gap-4">
                    <div>
                        <p className="font-medium text-slate-700 text-sm">{info.row.original.name}</p>
                    </div>
                </div>
            ),
        }),
        columnHelper.accessor('defaultCredits', {
            header: 'Policy Name',
            cell: (info) => (
                <div className="flex items-center gap-4">
                    <div>
                        <p className="font-medium text-slate-700 text-sm">{info.row.original.defaultCredits}</p>
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
                                show: can('leave-policy-edit')
                            },
                            {
                                label: 'Delete',
                                icon: Trash2,
                                onClick: () => handleDeleteClick(info.row.original),
                                variant: 'danger',
                                show: can('leave-policy-delete')
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
                    <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 text-slate-600">
                        <CalendarDays size={24} className="text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Leave Policy Management</h1>
                        <p className="text-slate-400 text-sm font-medium">Configure leave types, accruals, and policies.</p>
                    </div>
                </div>

                {can('leave-policy-create') && (
                    <Button variant="primary" icon={Plus} onClick={handleAdd}>Add Policy</Button>
                )}
            </div>

            <DataTable
                columns={columns}
                data={leavepolicies}
                loading={loading}
                showSearch={true}
            />

            <LeavePolicyForm 
                isOpen={isFormOpen} 
                onClose={() => setIsFormOpen(false)} 
                onSuccess={handleSuccess}
                onError={handleError}
                selectedLeavePolicy={selectedLeavePolicy} 
            />

            <ModalConfirmation 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                loading={isDeleting}
                title="Delete Policy"
                message={`Are you sure you want to delete ${selectedLeavePolicy?.name}? This action is permanent.`}
            />
        </div>
    );
}