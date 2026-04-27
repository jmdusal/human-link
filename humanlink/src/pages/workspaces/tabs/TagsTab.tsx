import { useState } from 'react';
import { Plus, ListTodo, Trash2 } from 'lucide-react';
import Searchbar from '@/components/shared/Searchbar';
import Button from '@/components/ui/Button';
import Pagination from '@/components/shared/ModalTabPagination';
import { usePageTitle } from '@/hooks/use-title';
import { useAuth } from '@/context/AuthContext';
import type { Tag } from '@/types';

interface TagsTabProps {
    tags: Tag[];
    data: any;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    handleEditTag: (tag: Tag) => void;
    handleDeleteTag: (tag: Tag) => void;
    setSelectedTag: (tag: Tag | null) => void;
    setIsTagFormOpen: (open: boolean) => void;
}

export default function TagsTab({ tags, data, searchQuery, setSearchQuery, handleEditTag, handleDeleteTag, setSelectedTag, setIsTagFormOpen, }: TagsTabProps) {
    usePageTitle("Tags")
    const { can, user } = useAuth();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    
    const workspaceRole = data.members.find((m: any) => m.id === user?.id)?.pivot?.role;
    const isWorkspaceAdminOrOwner = workspaceRole === 'owner' || workspaceRole === 'admin';
    const canEditInWorkspace = can('tags-edit') && isWorkspaceAdminOrOwner;
    
    const filteredStages = (tags || []).filter((tag: Tag) =>
        tag.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filteredStages.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedStages = filteredStages.slice(startIndex, startIndex + itemsPerPage);

    const handleSearch = (val: string) => {
        setSearchQuery(val);
        setCurrentPage(1);
    };
    
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 flex flex-col min-h-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h3 className="text-3xl font-bold text-slate-900 tracking-tight">Tags</h3>
                    <p className="text-slate-400 text-sm mt-1 font-medium">
                        Configure workflow columns for {data.name}.
                    </p>
                </div>
                
                <div className="flex items-center gap-4">
                    <Searchbar 
                        value={searchQuery} 
                        onChange={handleSearch} 
                        placeholder="Filter tags..." 
                    />

                    <Button 
                        variant="primary" 
                        icon={Plus}
                        onClick={() => {
                            setSelectedTag(null);
                            setIsTagFormOpen(true);
                        }}
                    >
                        New Tag
                    </Button>
                </div>
            </div>

            <div className="flex-1">
                {paginatedStages.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
                        {paginatedStages.map((tag: Tag) => (
                            <div 
                                key={tag.id} 
                                onClick={() => {
                                    // if (!canEditInWorkspace) return;
                                    handleEditTag(tag);
                                }}
                                className="group relative flex flex-col p-6 rounded-2xl bg-white border border-slate-200/60 
                                transition-all duration-300 ease-in-out shadow-sm
                                hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.07)] hover:border-slate-300 hover:-translate-y-1 cursor-pointer"
                            >
                                <div 
                                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none" 
                                    style={{ backgroundColor: tag.color }}
                                />

                                <div className="relative z-10 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-6">
                                        <div 
                                            className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-500 ring-4 ring-transparent group-hover:ring-white shadow-sm"
                                            style={{ backgroundColor: `${tag.color}20` }} 
                                        >
                                            <div 
                                                className="w-3.5 h-3.5 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.1)] border-2 border-white group-hover:scale-125 transition-transform" 
                                                style={{ backgroundColor: tag.color }} 
                                            />
                                        </div>  
                                    </div>

                                    <h4 className="text-[17px] font-semibold text-slate-900 mb-1 tracking-tight">
                                        {tag.name}
                                    </h4>
                                    
                                    <div className="flex-1">
                                        <p className="text-[13px] text-slate-500 font-medium leading-relaxed">
                                            Mapped to hex <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{tag.color}</span>
                                        </p>
                                    </div>

                                    <div className="mt-6 w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full transition-all duration-700 ease-out group-hover:w-full" 
                                            style={{ backgroundColor: tag.color, width: '100%' }}
                                        />
                                    </div>
                                </div>

                                <div className="relative mt-6 pt-5 flex items-center justify-between border-t border-slate-100/80 z-10">

                                    <div className="flex items-center gap-2 text-slate-400 group-hover:text-slate-600 transition-colors">
                                        {/* <Settings size={14} className="group-hover:rotate-90 transition-transform duration-500" /> */}
                                        {/* <span className="text-[10px] font-bold uppercase tracking-widest">Configure Stage</span> */}
                                    </div>

                                    <button
                                        onClick={(e) => { 
                                            e.stopPropagation(); 
                                            handleDeleteTag(tag);
                                        }}
                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>

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
                                ? `We couldn't find any tag matching "${searchQuery}"` 
                                : 'Start by launching your first project to organize your team.'
                            }
                        </p>
                    </div>
                )}
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                totalItems={filteredStages.length}
                onPageChange={setCurrentPage}
            />
        </div>
    );
}