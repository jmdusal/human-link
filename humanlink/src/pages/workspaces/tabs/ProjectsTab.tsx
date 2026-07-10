import { useState } from 'react';
import {
    FolderKanban,
    Plus,
    Trash2,
    LayoutGrid,
    List,
    ExternalLink,
} from 'lucide-react';
import Searchbar from '@/components/shared/Searchbar';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Pagination from '@/components/shared/ModalTabPagination';
import { formatSimpleDate } from '@/utils/dateUtils';
import { useAuth } from '@/context/AuthContext';
import { getInitials } from '@/utils/userUtils';
import { usePageTitle } from '@/hooks/use-title';
import type { Project } from '@/types';

interface ProjectsTabProps {
    projects: Project[];
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    data: any;
    handleEditProject: (project: Project) => void;
    handleDeleteProject: (project: Project) => void;
    setSelectedProject: (project: Project | null) => void;
    setIsProjectFormOpen: (open: boolean) => void;
    onViewBoard: (projectId: number) => void;
}

export default function ProjectsTab({
    projects,
    searchQuery,
    setSearchQuery,
    data,
    handleEditProject,
    handleDeleteProject,
    setSelectedProject,
    setIsProjectFormOpen,
    onViewBoard,
}: ProjectsTabProps) {
    usePageTitle('Projects');
    const { can, user } = useAuth();
    const [currentPage, setCurrentPage] = useState(1);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const itemsPerPage = viewMode === 'grid' ? 8 : 10;

    const workspaceRole = data.members.find((m: any) => m.id === user?.id)?.pivot?.role;
    const isWorkspaceAdminOrOwner = workspaceRole === 'owner' || workspaceRole === 'admin';
    const canEditInWorkspace = can('projects-edit') && isWorkspaceAdminOrOwner;

    const filteredProjects = projects
        .filter((project: Project) =>
            project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedProjects = filteredProjects.slice(startIndex, startIndex + itemsPerPage);

    const handleSearch = (val: string) => {
        setSearchQuery(val);
        setCurrentPage(1);
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 flex flex-col min-h-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h3 className="text-3xl font-bold text-slate-900 tracking-tight">Projects</h3>
                    <p className="text-slate-400 text-sm mt-1 font-medium">
                        Manage initiatives in {data.name}.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-slate-100/50 p-1 rounded-xl border border-slate-200/60">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                            aria-label="Grid view"
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                            aria-label="List view"
                        >
                            <List size={18} />
                        </button>
                    </div>

                    <Searchbar
                        value={searchQuery}
                        onChange={handleSearch}
                        placeholder="Filter projects..."
                    />

                    {isWorkspaceAdminOrOwner && (
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
                    viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {paginatedProjects.map((project: Project) => (
                                <Card
                                    key={project.id}
                                    hover
                                    onClick={() => {
                                        if (!canEditInWorkspace) return;
                                        handleEditProject(project);
                                    }}
                                    className={`group flex flex-col h-full ${
                                        canEditInWorkspace ? 'cursor-pointer' : 'cursor-default'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-3 mb-5">
                                        <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            <FolderKanban size={20} strokeWidth={2.5} />
                                        </div>

                                        <span className="text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wide border bg-emerald-50 border-emerald-100 text-emerald-600 shrink-0">
                                            {project.status || 'Active'}
                                        </span>
                                    </div>

                                    <h4 className="text-[15px] font-semibold text-slate-900 tracking-tight truncate">
                                        {project.name}
                                    </h4>
                                    <p className="text-[13px] text-slate-500 font-medium line-clamp-2 mt-1 min-h-[40px]">
                                        {project.description || 'No description provided.'}
                                    </p>

                                    <div className="mt-4 flex items-center justify-between gap-2 text-[11px] font-medium text-slate-400">
                                        <span className="truncate">
                                            {formatSimpleDate(project.startDate)} — {formatSimpleDate(project.endDate)}
                                        </span>
                                        <span className="shrink-0 text-slate-500 font-semibold">
                                            {project.tasks?.length || 0} tasks
                                        </span>
                                    </div>

                                    <div className="mt-auto pt-5 flex items-center justify-between border-t border-slate-100">
                                        <div className="flex -space-x-1.5">
                                            {project.projectMembers?.slice(0, 3).map((member: any) => (
                                                <div
                                                    key={member.id}
                                                    className="w-7 h-7 rounded-full bg-blue-50 border-2 border-white flex items-center justify-center shrink-0"
                                                    title={member.name}
                                                >
                                                    <span className="text-[9px] font-bold text-blue-600 uppercase">
                                                        {getInitials(member.name)}
                                                    </span>
                                                </div>
                                            ))}
                                            {(project.projectMembers?.length || 0) > 3 && (
                                                <div className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center shrink-0">
                                                    <span className="text-[8px] font-bold text-slate-500">
                                                        +{(project.projectMembers?.length || 0) - 3}
                                                    </span>
                                                </div>
                                            )}
                                            {!project.projectMembers?.length && (
                                                <span className="text-[11px] text-slate-300 font-medium">No members</span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-1">
                                            {can('projects-delete') && isWorkspaceAdminOrOwner && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteProject(project);
                                                    }}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    aria-label="Delete project"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            )}
                                            {can('projects-view') && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onViewBoard(project.id);
                                                    }}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    aria-label="Open board"
                                                >
                                                    <ExternalLink size={15} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="!p-0 overflow-hidden">
                            <div className="px-6 py-3 bg-slate-50/80 flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">
                                <div className="flex-[1.4]">Project</div>
                                <div className="flex-1 text-center">Members</div>
                                <div className="flex-1 text-center">Status</div>
                                <div className="flex-1 text-center">Timeline</div>
                                <div className="w-20 text-right">Actions</div>
                            </div>

                            {paginatedProjects.map((project: Project) => (
                                <div
                                    key={project.id}
                                    onClick={() => {
                                        if (!canEditInWorkspace) return;
                                        handleEditProject(project);
                                    }}
                                    className={`px-6 py-3.5 flex items-center border-b border-slate-50 last:border-b-0 hover:bg-slate-50/70 transition-colors ${
                                        canEditInWorkspace ? 'cursor-pointer' : 'cursor-default'
                                    }`}
                                >
                                    <div className="flex-[1.4] flex items-center gap-3 min-w-0">
                                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                                            <FolderKanban size={16} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-slate-900 truncate">{project.name}</p>
                                            <p className="text-[11px] text-slate-400 font-medium truncate">
                                                {project.description || 'No description'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex-1 flex justify-center">
                                        <div className="flex -space-x-1.5">
                                            {project.projectMembers?.slice(0, 3).map((member: any) => (
                                                <div
                                                    key={member.id}
                                                    className="w-6 h-6 rounded-full bg-blue-50 border-2 border-white flex items-center justify-center"
                                                    title={member.name}
                                                >
                                                    <span className="text-[8px] font-bold text-blue-600 uppercase">
                                                        {getInitials(member.name)}
                                                    </span>
                                                </div>
                                            ))}
                                            {(project.projectMembers?.length || 0) > 3 && (
                                                <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center">
                                                    <span className="text-[8px] font-bold text-slate-500">
                                                        +{(project.projectMembers?.length || 0) - 3}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex-1 flex justify-center">
                                        <span className="text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wide border bg-emerald-50 border-emerald-100 text-emerald-600">
                                            {project.status || 'Active'}
                                        </span>
                                    </div>

                                    <div className="flex-1 flex flex-col items-center justify-center">
                                        <span className="text-[11px] font-semibold text-slate-600">
                                            {formatSimpleDate(project.startDate)}
                                        </span>
                                        <span className="text-[10px] font-medium text-slate-400">
                                            to {formatSimpleDate(project.endDate)}
                                        </span>
                                    </div>

                                    <div className="w-20 flex justify-end gap-1">
                                        {can('projects-view') && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onViewBoard(project.id);
                                                }}
                                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                            >
                                                <ExternalLink size={14} />
                                            </button>
                                        )}
                                        {can('projects-delete') && isWorkspaceAdminOrOwner && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteProject(project);
                                                }}
                                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </Card>
                    )
                ) : (
                    <Card className="flex flex-col items-center justify-center py-20">
                        <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mb-5">
                            <FolderKanban size={24} className="text-slate-300" />
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 tracking-tight">
                            {searchQuery ? 'No matches found' : 'No projects yet'}
                        </h4>
                        <p className="text-slate-400 text-sm mt-2 max-w-[260px] text-center font-medium leading-relaxed">
                            {searchQuery
                                ? `We couldn't find any projects matching "${searchQuery}"`
                                : 'Create your first project to organize work in this workspace.'}
                        </p>
                    </Card>
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
