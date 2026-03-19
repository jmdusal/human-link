import { useMemo, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { createColumnHelper } from "@tanstack/react-table";
import { Plus, MoreHorizontal, Eye, Pencil, Trash2, Clock, CalendarDays } from 'lucide-react';
import { DataTable } from '@/components/Datatable';
// import ModalView from '../components/modal/ModalView';
import api from '@/api/axios';
import Button from '@/components/Button';
import PermissionForm from '@/pages/permissions/PermissionForm';
import ModalConfirmation from '@/components/modals/ModalConfirmation';
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
            // header: 'Action',
            cell: (info) => (
                <div className="text-right relative px-6">
                    <button
                        onClick={() => setOpenDropdown(openDropdown === info.row.original.id ? null : info.row.original.id)}
                        className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer border-none bg-transparent"
                    >
                        <MoreHorizontal size={20} />
                    </button>
                    
                    {openDropdown === info.row.original.id && (
                        <>
                            <div className="fixed inset-0 z-20" onClick={() => setOpenDropdown(null)}></div>
                            <div className="absolute right-8 bottom-full mb-2 w-44 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border border-slate-100 z-30 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                <div className="py-2">
                                    <button
                                        onClick={() => handleView(info.row.original)}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-colors border-none bg-transparent cursor-pointer"
                                    >
                                        <Eye size={14} className="text-blue-500" /> Show/View
                                    </button>
                                    
                                    {can('permission-edit') && (
                                        <button 
                                            onClick={() => handleEdit(info.row.original)}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-colors border-none bg-transparent cursor-pointer"
                                        >
                                            <Pencil size={14} className="text-amber-500" /> Edit
                                        </button>
                                    )}
                                    
                                    {can('permission-delete') && (
                                        <button
                                            onClick={() => handleDeleteClick(info.row.original)}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold text-red-500 hover:bg-red-50 transition-colors border-none bg-transparent cursor-pointer"
                                        >
                                            <Trash2 size={14} /> Delete
                                        </button>
                                    )}
                                    
                                </div>
                            </div>
                        </>
                    )}
                </div>
            ),
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
                        <p className="text-slate-400 text-sm font-medium">Configure leave types, accruals, and company policies.</p>
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