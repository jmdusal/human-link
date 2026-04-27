import { useState } from 'react';
import { Plus, ListTodo, Trash2, Pencil } from 'lucide-react';
import Searchbar from '@/components/shared/Searchbar';
import Button from '@/components/ui/Button';
import Pagination from '@/components/shared/ModalTabPagination';
import { usePageTitle } from '@/hooks/use-title';
import { useAuth } from '@/context/AuthContext';
import ReorderStatusForm from '@/pages/statuses/ReorderStatusForm';
import type { Status } from '@/types';

interface SettingsTabProps {
    statuses: Status[];
    data: any;
    // setData: (data: any) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    handleEditStatus: (status: Status) => void;
    handleDeleteStatus: (status: Status) => void;
    setSelectedStatus: (status: Status | null) => void;
    setIsStatusFormOpen: (open: boolean) => void;
    onSuccess: (newList: Status[]) => void;
}

export default function StatusesTab({ statuses, data, searchQuery, setSearchQuery, handleEditStatus, handleDeleteStatus, setSelectedStatus, setIsStatusFormOpen, onSuccess }: SettingsTabProps) {
    usePageTitle("Staging")
    const { can, user } = useAuth();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    
    const workspaceRole = data.members.find((m: any) => m.id === user?.id)?.pivot?.role;
    const isWorkspaceAdminOrOwner = workspaceRole === 'owner' || workspaceRole === 'admin';
    const canEditInWorkspace = can('statuses-edit') && isWorkspaceAdminOrOwner;

    const sortedStatuses = [...(statuses || [])].sort((a, b) => a.position - b.position);
    const gridOrderKey = sortedStatuses.map(s => `${s.id}-${s.position}`).join('|');

    const filteredStages = sortedStatuses.filter((status: Status) =>
        status.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    // const filteredStages = (statuses || []).filter((status: any) =>
    //     status.name.toLowerCase().includes(searchQuery.toLowerCase())
    // );

    const totalPages = Math.ceil(filteredStages.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedStages = filteredStages.slice(startIndex, startIndex + itemsPerPage);
    
    const [isReorderOpen, setIsReorderOpen] = useState(false);

    const handleSearch = (val: string) => {
        setSearchQuery(val);
        setCurrentPage(1);
    };
    
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 flex flex-col min-h-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h3 className="text-3xl font-bold text-slate-900 tracking-tight">Stages</h3>
                    <p className="text-slate-400 text-sm mt-1 font-medium">
                        Configure workflow columns for {data.name}.
                    </p>
                </div>
                
                <div className="flex items-center gap-4">
                    <Searchbar 
                        value={searchQuery} 
                        onChange={handleSearch} 
                        placeholder="Filter stages..." 
                    />
                    
                    <Button 
                        variant="primary" 
                        // icon={Plus}
                        onClick={() => {
                            
                            setIsReorderOpen(true);
                        }}
                    >
                        Reorder Positions
                    </Button>
                    
                    <Button 
                        variant="primary" 
                        icon={Plus}
                        onClick={() => {
                            setSelectedStatus(null);
                            setIsStatusFormOpen(true);
                        }}
                    >
                        New Stage
                    </Button>
                </div>
            </div>

            <div className="flex-1" key={gridOrderKey}>
                {paginatedStages.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
                        {paginatedStages.map((status: Status) => (
                            <div 
                                key={`${status.id}-${status.position}`} 
                                // key={status.id || index} 
                                onClick={() => {
                                        // if (!canEditInWorkspace) return;
                                    handleEditStatus(status);
                                }}
                                className="group relative flex flex-col p-6 rounded-2xl bg-white border border-slate-200/60 
                                transition-all duration-300 ease-in-out shadow-sm
                                hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.07)] hover:border-slate-300 hover:-translate-y-1 cursor-pointer"
                            >
                                <div 
                                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none" 
                                    style={{ backgroundColor: status.colorHex }}
                                />

                                <div className="relative z-10 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-6">
                                        {/* Status Color Indicator */}
                                        <div 
                                            className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-500 ring-4 ring-transparent group-hover:ring-white shadow-sm"
                                            style={{ backgroundColor: `${status.colorHex}20` }} 
                                        >
                                            <div 
                                                className="w-3.5 h-3.5 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.1)] border-2 border-white group-hover:scale-125 transition-transform" 
                                                style={{ backgroundColor: status.colorHex }} 
                                            />
                                        </div>
                                        
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-full group-hover:bg-white transition-colors shadow-sm">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                                {/* Position {status.position + 1} */}
                                                Position {status.position}
                                            </span>
                                        </div>
                                    </div>

                                    <h4 className="text-[17px] font-semibold text-slate-900 mb-1 tracking-tight">
                                        {status.name}
                                    </h4>
                                    
                                    <div className="flex-1">
                                        <p className="text-[13px] text-slate-500 font-medium leading-relaxed">
                                            Mapped to hex <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{status.colorHex}</span>
                                        </p>
                                    </div>

                                    {/* Visual Bar */}
                                    <div className="mt-6 w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full transition-all duration-700 ease-out group-hover:w-full" 
                                            style={{ backgroundColor: status.colorHex, width: '100%' }}
                                        />
                                    </div>
                                </div>

                                <div className="relative mt-6 pt-5 flex items-center justify-between border-t border-slate-100/80 z-10">

                                    {/* <div className="flex items-center gap-2 text-slate-400 group-hover:text-slate-600 transition-colors">
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Configure Stage</span>
                                    </div> */}
                                    
                                    <div className="absolute top-4 right-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out translate-y-1 group-hover:translate-y-0">
                                                    
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditStatus(status);
                                            }}
                                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:shadow-sm active:scale-90 active:bg-blue-100"
                                            title="Edit Task"
                                        >
                                            <Pencil size={13} strokeWidth={2.5} />
                                        </button>
                                                                            
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteStatus(status);
                                            }}
                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 hover:shadow-sm active:scale-90 active:bg-red-100"
                                            title="Delete Task"
                                        >
                                            <Trash2 size={13} strokeWidth={2.5} />
                                        </button>
                                    </div>

                                    {/* <button
                                        onClick={(e) => { 
                                            e.stopPropagation(); 
                                            handleDeleteStatus(status);
                                        }}
                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button> */}

                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    
                    <div className="flex flex-col items-center justify-center py-32 rounded-[40px] bg-slate-50/30">
                        <div className="w-16 h-16 bg-white shadow-sm rounded-2xl flex items-center justify-center mb-6">
                            <ListTodo size={28} className="text-slate-200" />
                        </div>
                        <h4 className="text-xl font-bold text-slate-900 tracking-tight">
                            {searchQuery ? 'No matches found' : 'Initialize Workspace'}
                        </h4>
                        <p className="text-slate-400 text-sm mt-2 max-w-[240px] text-center font-medium leading-relaxed">
                            {searchQuery
                                ? `We couldn't find any status matching "${searchQuery}"` 
                                : 'Start by launching your first project to organize your team.'
                            }
                        </p>
                    </div>
                    
                    
                    
                    // <div className="flex flex-col items-center justify-center py-32 rounded-[40px] bg-slate-50/30">
                    //      <p className="text-slate-400 text-sm font-medium">No stages found.</p>
                    // </div>
                )}
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                totalItems={filteredStages.length}
                onPageChange={setCurrentPage}
            />
            
            <ReorderStatusForm 
                isOpen={isReorderOpen}
                onClose={() => setIsReorderOpen(false)}
                existingStatuses={statuses}
                // existingStatuses={data.statuses}
                // existingStatuses={[...data.statuses].sort((a, b) => a.position - b.position)}
                // existingStatuses={sortedStatuses} 
                // onSuccess={onSuccess}
                
                onSuccess={onSuccess}
            />

        </div>
    );
}