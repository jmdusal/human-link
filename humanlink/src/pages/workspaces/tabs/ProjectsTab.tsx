import { useState } from 'react';
import { 
    FolderKanban, 

    Plus, 
    Trash2, 
    LayoutGrid, 
    List,
    ExternalLink,
    ArrowUpRight
} from 'lucide-react';
import Searchbar from '@/components/shared/Searchbar';
import Button from '@/components/ui/Button';
import Pagination from '@/components/shared/ModalTabPagination';
import { formatSimpleDate } from '@/utils/dateUtils';
import { useAuth } from '@/context/AuthContext';
import { getInitials } from '@/utils/userUtils'
import { usePageTitle } from '@/hooks/use-title';
import { AnimatePresence } from 'framer-motion';

interface ProjectsTabProps {
    projects: any[];
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    data: any;
    handleEditProject: (project: any) => void;
    handleDeleteProject: (project: any) => void;
    setSelectedProject: (project: any | null) => void;
    setIsProjectFormOpen: (open: boolean) => void;
    onViewBoard: (projectId: string) => void;
}

export default function ProjectsTab({ projects, searchQuery, setSearchQuery, data, handleEditProject, handleDeleteProject, setSelectedProject, setIsProjectFormOpen, onViewBoard, }: ProjectsTabProps) {
    usePageTitle("Projects")
    const { can, user } = useAuth(); 
    const [currentPage, setCurrentPage] = useState(1);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const itemsPerPage = viewMode === 'grid' ? 8 : 10;
    
    const workspaceRole = data.members.find((m: any) => m.id === user?.id)?.pivot?.role;
    const isWorkspaceAdminOrOwner = workspaceRole === 'owner' || workspaceRole === 'admin';
    const canEditInWorkspace = can('projects-edit') && isWorkspaceAdminOrOwner;
    
    const filteredProjects = projects.filter((project: any) =>
            project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .sort((a: any, b: any) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

    const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedProjects = filteredProjects.slice(startIndex, startIndex + itemsPerPage);

    const handleSearch = (val: string) => {
        setSearchQuery(val);
        setCurrentPage(1);
    };
    
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 flex flex-col min-h-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h3 className="text-3xl font-bold text-slate-900 tracking-tight">Projects</h3>
                    <p className="text-slate-400 text-sm mt-1 font-medium">
                        Manage initiatives in {data.name}.
                    </p>
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
                    </div>

                    {/* <AnimatePresence mode="wait"></AnimatePresence> */}
                    
                    <Searchbar
                        value={searchQuery}
                        onChange={handleSearch}
                        placeholder="Filter projects..." 
                    />
                    
                    {can('projects-create') && isWorkspaceAdminOrOwner && (
                        <Button
                            variant="primary" 
                            icon={Plus}
                            onClick={() => {
                                setSelectedProject(null);
                                setIsProjectFormOpen(true);
                            }}
                        >
                            New Project
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex-1">
                {paginatedProjects.length > 0 ? (
                    // GRID VIEW
                    viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
                            {paginatedProjects.map((project: any) => (
                                <div
                                    key={project.id}
                                    onClick={() => {
                                        if (!canEditInWorkspace) return;
                                        handleEditProject(project);
                                    }}
                                    className={`group relative flex flex-col h-full p-6 rounded-2xl bg-white border border-slate-200/60 
                                    transition-all duration-300 ease-in-out shadow-sm
                                    ${canEditInWorkspace 
                                        ? 'hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.07)] hover:border-blue-500/30 hover:-translate-y-1 cursor-pointer' 
                                        : 'cursor-default opacity-95'
                                    }`}
                                >
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                    <div className="relative flex-1 flex flex-col z-10">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="w-11 h-11 bg-slate-50 rounded-xl flex items-center justify-center text-slate-500 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 ring-4 ring-transparent group-hover:ring-blue-50">
                                                <FolderKanban size={20} strokeWidth={2.5} />
                                            </div>
                                            
                                            <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50/60 border border-emerald-100 rounded-full">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700/80">
                                                    {project.status || 'Active'}
                                                </span>
                                            </div>
                                        </div>

                                        <h4 className="text-[17px] font-semibold text-slate-900 mb-2 tracking-tight">
                                            {project.name}
                                        </h4>

                                        <div className="flex-1">
                                            <p className="text-[13px] text-slate-500 font-medium leading-relaxed line-clamp-2">
                                                {project.description || 'No description provided.'}
                                            </p>
                                        </div>
                                        
                                        <div className="mt-6 flex items-center justify-between py-3 px-3 bg-slate-50/50 rounded-xl border border-slate-100 group-hover:bg-white transition-colors">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Timeline</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[11px] font-semibold text-slate-700">
                                                        {formatSimpleDate(project.startDate)}
                                                    </span>
                                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                                    <span className="text-[11px] font-semibold text-slate-700">
                                                        {formatSimpleDate(project.endDate)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[11px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded shadow-sm border border-slate-100">
                                                    {project.tasks?.length || 0}
                                                </span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">Tasks</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative mt-6 pt-5 flex items-center justify-between border-t border-slate-100/80 z-10">
                                        <div className="flex -space-x-2.5">
                                            {project.projectMembers?.slice(0, 3).map((member: any) => (
                                                <div 
                                                    key={member.id} 
                                                    className="w-7 h-7 rounded-full bg-gradient-to-tr from-slate-100 to-slate-200 border-2 border-white flex items-center justify-center shrink-0 shadow-sm"
                                                >
                                                    <span className="text-[10px] font-bold text-slate-600">
                                                        {getInitials(member.name)}
                                                    </span>
                                                </div>
                                            ))}
                                            
                                            {project.projectMembers?.length > 3 && (
                                                <div className="w-7 h-7 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center shrink-0">
                                                    <span className="text-[9px] font-bold text-white">
                                                        +{project.projectMembers.length - 3}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-1">
                                            {can('projects-delete') && isWorkspaceAdminOrOwner && (
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteProject(project); }}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                            <div className="p-2 text-slate-300 group-hover:text-blue-500 transition-colors">
                                                {can('projects-view') && (
                                                    <button
                                                        onClick={(e) => { 
                                                            e.stopPropagation(); 
                                                            onViewBoard(project.id); 
                                                        }}
                                                        className="p-2 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    >
                                                        <ExternalLink size={16} />
                                                    </button>
                                                )}
                                                {/* <ArrowUpRight size={18} /> */}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        // LIST VIEW
                        <div className="flex flex-col gap-px bg-slate-200/50 rounded-2xl border border-slate-200/60 overflow-hidden">
                            <div className="px-6 py-3 bg-slate-50/80 flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200/60">
                                <div className="flex-[1]">Project Details</div>
                                <div className="flex-1 text-center">Members</div> 
                                <div className="flex-1 text-center">Status</div>
                                <div className="flex-1 text-center">Timeline</div>
                                <div className="w-10"></div>
                            </div>

                            {paginatedProjects.map((project: any) => (
                                <div 
                                    key={project.id}
                                    onClick={() => {
                                        if (!canEditInWorkspace) return;
                                        handleEditProject(project);
                                    }}
                                    className="group bg-white px-6 py-3.5 flex items-center hover:bg-slate-50 transition-colors duration-150 cursor-pointer"
                                >
                                    <div className="flex-[1] flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-50 group-hover:bg-white rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-all duration-500 shadow-sm border border-transparent group-hover:border-slate-100">
                                            <FolderKanban size={22} />
                                        </div>
                                        
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="text-sm font-semibold text-slate-900 truncate">{project.name}</span>
                                            <span className="text-[11px] text-slate-400 font-medium truncate">
                                                {project.description || 'No description provided'}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    
                                    <div className="flex-1 flex justify-center">
                                        <div className="flex -space-x-2">
                                            {project.projectMembers?.slice(0, 3).map((member: any) => (
                                                <div 
                                                    key={member.id} 
                                                    className="w-6 h-6 rounded-full bg-blue-50 border-2 border-white ring-1 ring-blue-100 flex items-center justify-center overflow-hidden shrink-0"
                                                >
                                                    <span className="text-[9px] font-bold text-blue-600 uppercase tracking-tighter">
                                                        {getInitials(member.name)}
                                                    </span>
                                                </div>
                                            ))}
                                            
                                            {project.projectMembers?.length > 3 && (
                                                <div className="w-6 h-6 rounded-full bg-slate-50 border-2 border-white ring-1 ring-slate-100 flex items-center justify-center shrink-0">
                                                    <span className="text-[8px] font-black text-slate-400">
                                                        +{project.projectMembers.length - 3}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    

                                    <div className="flex-1 flex justify-center">
                                        <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter border
                                            ${project.status === 'active' || !project.status 
                                                ? 'bg-emerald-400/10 border-emerald-200/50 text-emerald-600' 
                                                : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
                                            {project.status || 'Active'}
                                        </div>
                                    </div>

                                    <div className="flex-1 flex flex-col items-center justify-center">
                                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">
                                            {formatSimpleDate(project.startDate)}
                                        </span>
                                        <span className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter">
                                            to {formatSimpleDate(project.endDate)}
                                        </span>
                                    </div>

                                    <div className="w-10 flex justify-end">
                                        {can('projects-delete') && isWorkspaceAdminOrOwner ? (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleDeleteProject(project); }}
                                                className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        ) : (
                                            <FolderKanban size={14} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                   <div className="flex flex-col items-center justify-center py-32 rounded-[40px] bg-slate-50/30">
                        <div className="w-16 h-16 bg-white shadow-sm rounded-2xl flex items-center justify-center mb-6">
                            <FolderKanban size={28} className="text-slate-200" />
                        </div>
                        <h4 className="text-xl font-bold text-slate-900 tracking-tight">
                            {searchQuery ? 'No matches found' : 'Initialize Workspace'}
                        </h4>
                        <p className="text-slate-400 text-sm mt-2 max-w-[240px] text-center font-medium leading-relaxed">
                            {searchQuery
                                ? `We couldn't find any projects matching "${searchQuery}"` 
                                : 'Start by launching your first project to organize your team.'
                            }
                        </p>
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div className="mt-10">
                    <Pagination 
                        currentPage={currentPage} 
                        totalPages={totalPages} 
                        onPageChange={setCurrentPage} 
                        itemsPerPage={itemsPerPage}
                        totalItems={filteredProjects.length} 
                    />
                </div>
            )}
        </div>
    );
}
