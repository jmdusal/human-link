import { useMemo, useState } from 'react';
import { createColumnHelper } from "@tanstack/react-table";
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, ExternalLink, LayoutGrid, List, Globe, Calendar, Trash2, FolderKanban, Columns2Icon, Columns3 } from 'lucide-react';
import toast from 'react-hot-toast';
import { DataTable } from '@/components/shared/Datatable';
import Button from '@/components/ui/Button';
import WorkspaceForm from '@/pages/workspaces/WorkspaceForm';
import ModalConfirmation from '@/components/modals/ModalConfirmation';
import TableActions from '@/components/shared/TableActions';
import { useAuth } from '@/context/AuthContext';
import type { Workspace, Project } from '@/types';
import { WorkspaceService } from '@/services/WorkspaceService';
import { useWorkspaces } from '@/hooks/use-workspace';
import { TextCell, DateCell } from '@/components/shared/TableCells';
import Searchbar from '@/components/shared/Searchbar';
import { getInitials } from '@/utils/userUtils';
import Pagination from '@/components/ui/Pagination';
import { AnimatePresence } from 'framer-motion';

const columnHelper = createColumnHelper<Workspace>();

export default function WorkspaceIndex() {
    const navigate = useNavigate();
    const { can, user } = useAuth();
    const { workspaces, setWorkspaces, loading } = useWorkspaces(true);
    
    const [viewMode, setViewMode] = useState<'grid' | 'list' | 'timeline'>('grid');
    const [globalFilter, setGlobalFilter] = useState('');
    
    const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
    
    const [openDropdown, setOpenDropdown] = useState<number | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    
    const filteredWorkspaces = useMemo(() => {
        return workspaces.filter(ws => 
            ws.name.toLowerCase().includes(globalFilter.toLowerCase()) || 
            ws.slug.toLowerCase().includes(globalFilter.toLowerCase())
        );
    }, [workspaces, globalFilter]);
    
    const paginatedWorkspaces = filteredWorkspaces.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
    
    const handleAdd = () => {
        setSelectedWorkspace(null);
        setIsFormOpen(true);
    };

    const handleSuccess = (workspaceData: Workspace) => {
        if (selectedWorkspace) {
            setWorkspaces(prev => prev.map(w => w.id === workspaceData.id ? workspaceData : w));
        } else {
            setWorkspaces(prev => [workspaceData, ...prev]);
        }
    };
    
    const handleOpenWorkspace = (workspace: Workspace) => {
        navigate(`/workspaces/${workspace.slug}`, { 
            state: { workspace } 
        });
    };
    
    const handleEdit = (workspace: Workspace) => {
        setSelectedWorkspace(workspace);
        setIsFormOpen(true);
    };
    
    const handleDeleteClick = (workspace: Workspace) => {
        setSelectedWorkspace(workspace);
        setIsDeleteModalOpen(true);
        setOpenDropdown(null);
    };

    const handleConfirmDelete = async () => {
        if (!selectedWorkspace) return;
        setIsDeleting(true);
        try {
            await WorkspaceService.deleteWorkspace(selectedWorkspace.id);
            setWorkspaces(prev => prev.filter(w => w.id !== selectedWorkspace.id));
            toast.success('Workspace removed successfully.');
            setIsDeleteModalOpen(false);
        } catch (err: any) {
            toast.error("Failed to delete workspace.");
        } finally {
            setIsDeleting(false);
            setSelectedWorkspace(null);
        }
    };
    
    const columns = useMemo(() => [
        columnHelper.accessor('name', {
            header: 'Workspace Name',
            cell: (info) => (
                <div className="flex flex-col">
                    <TextCell title={info.getValue()} />
                    <span className="text-xs text-slate-400 font-mono">/{info.row.original.slug}</span>
                </div>
            ),
        }),
        columnHelper.accessor('createdAt', {
            header: 'Created',
            cell: (info) => <DateCell date={info.getValue()} />,
        }),
        columnHelper.display({
            id: 'actions',
            size: 50,
            header: () => <div className="text-right">Actions</div>,
            cell: (info) => (
                <TableActions
                    actions={[
                        { 
                            label: 'Open Workspace', 
                            icon: ExternalLink, 
                            onClick: () => handleOpenWorkspace(info.row.original),
                            show: can('workspaces-view')
                        },
                        {
                            label: 'Edit', 
                            icon: Pencil, 
                            onClick: () => handleEdit(info.row.original),
                            show: can('workspaces-edit')
                        },
                        {
                            label: 'Delete',
                            icon: Trash2,
                            onClick: () => handleDeleteClick(info.row.original),
                            variant: 'danger',
                            show: can('workspaces-delete')
                        },
                    ]}
                />
            ),
        }),
    ], [openDropdown, can, user]);

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Workspaces</h1>
                    <p className="text-slate-400 text-sm font-medium">Manage your professional environments.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-slate-100/50 p-1 rounded-xl border border-slate-200/60 mr-2">
                        <button 
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button 
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <List size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('timeline')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'timeline' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <Calendar size={18} />
                        </button>
                    </div>

                    {can('workspaces-create') && (
                        <Button variant="primary" icon={Plus} onClick={handleAdd}>New Workspace</Button>
                    )}
                </div>
            </div>

            {viewMode === 'list' && (
                <DataTable
                    columns={columns}
                    data={workspaces}
                    loading={loading}
                    showSearch={true} 
                />
            )}
            
            {viewMode === 'grid' && (
                <div className="space-y-6">
                    {!loading && (
                        <div className="max-w-sm">
                            <Searchbar 
                                value={globalFilter} 
                                onChange={setGlobalFilter}
                                placeholder="Search..."
                            />
                        </div>
                    )}
 
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 isolate">
                        {loading ? (
                            [...Array(8)].map((_, i) => (
                                <div key={`skeleton-${i}`} className="h-44 bg-slate-50 border border-slate-100 rounded-[28px] animate-pulse" />
                            ))
                        ) : (
                            paginatedWorkspaces.map((ws, index) => (
                                <div 
                                    key={ws.id}
                                    className="group relative flex flex-col justify-between p-6 rounded-[28px] bg-white border border-slate-200 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 cursor-pointer animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
                                    style={{ 
                                        animationDelay: `${index * 100}ms` 
                                    }}
                                    onClick={() => handleOpenWorkspace(ws)}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1 group-hover:translate-x-1 transition-transform duration-300">
                                            <h3 className="font-bold text-slate-800 truncate max-w-[140px]">
                                                {ws.name}
                                            </h3>
                                            <div className="flex items-center gap-1.5 text-slate-400">
                                                <Globe size={12} className="shrink-0" />
                                                <div className="max-w-[180px] sm:max-w-[140px]"> 
                                                    <span className="text-[11px] font-mono truncate lowercase block">
                                                        /{ws.slug}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div 
                                            className="relative z-[50]" 
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <TableActions
                                                actions={[
                                                    {
                                                        label: 'Edit', 
                                                        icon: Pencil, 
                                                        onClick: () => handleEdit(ws),
                                                        show: can('workspaces-edit')
                                                    },
                                                    {
                                                        label: 'Delete',
                                                        icon: Trash2,
                                                        onClick: () => handleDeleteClick(ws),
                                                        variant: 'danger',
                                                        show: can('workspaces-delete')
                                                    },
                                                ]}
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-10 flex items-center justify-between">
                                        <div className="flex -space-x-1.5">
                                            {ws.members?.slice(0, 3).map((member: any) => (
                                                <div 
                                                    key={member.id} 
                                                    className="w-7 h-7 rounded-full bg-blue-50 border-2 border-white flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:z-10"
                                                    title={member.name}
                                                >
                                                    <span className="text-[9px] font-bold text-blue-600 uppercase">
                                                        {getInitials(member.name)}
                                                    </span>
                                                </div>
                                            ))}
                                            
                                            {ws.members && ws.members.length > 3 && (
                                                <div className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110">
                                                    <span className="text-[8px] font-black text-slate-500">
                                                        +{ws.members.length - 3}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleOpenWorkspace(ws);
                                            }}
                                            className="flex items-center gap-1.5 text-slate-900 font-bold text-xs cursor-pointer group/btn"
                                        >
                                            <span className="group-hover/btn:underline decoration-slate-300 underline-offset-4">Open</span>
                                            <ExternalLink size={13} className="text-slate-300 group-hover/btn:text-slate-900 transition-colors" />
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    
                    {!loading && (
                        <div className="pt-4">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={Math.ceil(filteredWorkspaces.length / itemsPerPage)}
                                onPageChange={setCurrentPage}
                                totalItems={filteredWorkspaces.length}
                                itemsPerPage={itemsPerPage}
                            />
                        </div>
                    )}
                </div>
            )}

            
            {viewMode === 'timeline' && (
                <div className="relative space-y-12 py-10 overflow-x-auto min-h-[500px] animate-in fade-in duration-700 bg-slate-50/30 rounded-[32px] border border-slate-100/50">
                    <div className="flex gap-12 pb-12 min-w-max px-10">
                        {filteredWorkspaces.map((ws, index) => (
                            <div key={ws.id} className="relative flex flex-col items-center">
                                
                                {/* 1. Date Header */}
                                <div className="flex flex-col items-center mb-6">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                        {new Date(ws.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                    <div className="h-4 w-[2px] bg-slate-200 mt-2" />
                                </div>

                                {/* 2. Workspace Node */}
                                <div className="relative flex flex-col items-center group">
                                    {/* Horizontal Connector Line */}
                                    {index !== filteredWorkspaces.length - 1 && (
                                        <div className="absolute top-6 left-1/2 w-[calc(100%+48px)] h-[2px] bg-slate-200/60 z-0" />
                                    )}

                                    {/* Main Workspace Icon/Dot */}
                                    <div className="w-12 h-12 rounded-2xl bg-white border-2 border-slate-200 shadow-sm flex items-center justify-center z-10 group-hover:border-blue-500 group-hover:shadow-blue-500/10 transition-all duration-500">
                                        <Globe size={20} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                                    </div>

                                    {/* Info Card */}
                                    <div className="mt-4 w-64 p-5 rounded-[24px] bg-white border border-slate-200 shadow-sm group-hover:shadow-xl group-hover:shadow-blue-500/5 transition-all">
                                        <h4 className="font-bold text-slate-800 truncate text-sm">{ws.name}</h4>
                                        <p className="text-[10px] font-mono text-slate-400 mt-1 uppercase tracking-tighter">/{ws.slug}</p>
                                        
                                        <div className="mt-4 flex items-center justify-between">
                                            <div className="flex -space-x-1.5">
                                                {ws.members?.slice(0, 3).map((m: any) => (
                                                    <div key={m.id} className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] font-bold text-slate-600">
                                                        {getInitials(m.name)}
                                                    </div>
                                                ))}
                                            </div>
                                            <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase">
                                                {ws.projects?.length || 0} Projects
                                            </span>
                                        </div>
                                    </div>

                                    {/* 3. Nested Projects Branch */}
                                    {ws.projects && ws.projects.length > 0 && (
                                        <div className="mt-6 flex flex-col items-center w-full space-y-3">
                                            <div className="h-6 w-[2px] bg-slate-100" />
                                            {ws.projects.map((project: any) => (
                                                <div 
                                                    key={project.id}
                                                    className="w-[85%] p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3 hover:bg-white hover:border-blue-200 transition-all cursor-pointer group/project"
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover/project:text-blue-500">
                                                        <FolderKanban size={14} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[11px] font-bold text-slate-700 truncate">{project.name}</p>
                                                        <p className="text-[9px] text-slate-400 font-medium">Project</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            <AnimatePresence>
                {isFormOpen && (
                    <WorkspaceForm
                        key={selectedWorkspace ? `edit-${selectedWorkspace.id}` : 'create-workspace'}
                        isOpen={isFormOpen} 
                        onClose={() => setIsFormOpen(false)} 
                        onSuccess={handleSuccess}
                        selectedWorkspace={selectedWorkspace} 
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
                        title="Delete Workspace"
                        message={`Are you sure you want to delete ${selectedWorkspace?.name}? All projects and tasks within this workspace will be lost.`}
                    /> 
                )}
            </AnimatePresence>
            
        </div>
    );
}
