import { useState, useEffect } from 'react';
import ModalTabs from '@/components/ui/ModalTabs';
import CloseButton from '@/components/ui/CloseButton';
import { 
    LayoutDashboard, 
    Users, 
    Settings, 
    Kanban, 
    FolderKanban, 
    Globe,
    Shield
} from 'lucide-react';
import ProjectForm from '@/pages/projects/ProjectForm';
import ProjectsTab from '@/pages/workspaces/tabs/ProjectsTab';
import TaskBoardTab from '@/pages/workspaces/tabs/TaskBoardTab';
import SettingsTab from '@/pages/workspaces/tabs/SettingsTab';
import OverviewTab from '@/pages/workspaces/tabs/OverviewTab';
import { toast } from 'react-hot-toast';
import { ProjectService } from '@/services/ProjectService';
import ModalConfirmation from '@/components/modals/ModalConfirmation';
import MembersTab from '../../../pages/workspaces/tabs/MembersTab';
import { useUsers } from '@/hooks/use-users';
import { WorkspaceService } from '@/services/WorkspaceService';
import WorkspaceLayout from '@/components/layouts/WorkspaceLayout';

interface WorkspaceModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: any;
}

const TABS = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'board', label: 'Task Board', icon: Kanban },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
];

export default function WorkspaceDashboardModal({ isOpen, onClose, data }: WorkspaceModalProps) {
    const [activeTab, setActiveTab] = useState('overview');
    const [searchQuery, setSearchQuery] = useState('');
    
    const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<any | null>(null);
    const [projects, setProjects] = useState<any[]>(data.projects || []);
    
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    
    const { userOptions } = useUsers(isOpen);
    
    // const [localMembers, setLocalMembers] = useState(data?.members || []);
    
    const [workspaceMembers, setWorkspaceMembers] = useState(data?.members || []);
    
    // const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
    const [activeBoardProjectId, setActiveBoardProjectId] = useState<string | null>(null);

    useEffect(() => {
        setWorkspaceMembers(data?.members || []);
    }, [data?.members, isOpen]);
    
    const handleUpdateMembers = async (newMembers: any[]) => {
        // console.log('check emails', newMembers);
        data.members = newMembers;
        setWorkspaceMembers(newMembers);

        try {
            await WorkspaceService.saveWorkspace({ 
                ...data, 
                members: newMembers 
            }, data.id);
            
            // data.members = newMembers;
            toast.success('Workspace team updated successfully.');
        } catch (err) {
            
            // setWorkspaceMembers(data?.members || []);
            const originalMembers = data.members;
                setWorkspaceMembers(originalMembers);
                data.members = originalMembers;
            toast.error('Failed to update members.');
        }
    };
    
    const handleDeleteProject = (project: any) => {
        setSelectedProject(project);
        setIsDeleteModalOpen(true);
    };
    
    const handleConfirmDelete = async () => {
        if (!selectedProject) return;
        setIsDeleting(true);
        try {
            await ProjectService.deleteProject(selectedProject.id);
            const updatedProjects = projects.filter(p => p.id !== selectedProject.id);
            setProjects(updatedProjects);
            data.projects = updatedProjects;
            toast.success('Project deleted successfully.');
            setIsDeleteModalOpen(false);
        } catch (err) {
            toast.error('Failed to delete project.');
        } finally {
            setIsDeleting(false);
            setSelectedProject(null);
        }
    };
    
    const handleProjectSuccess = (newProject: any) => {
        if (selectedProject) {
            setProjects(prev => prev.map(p => p.id === newProject.id ? newProject : p));
            data.projects = data.projects.map((p: any) => p.id === newProject.id ? newProject : p);
        } else {
            setProjects(prev => [newProject, ...prev]);
            if (!data.projects) data.projects = [];
            data.projects.unshift(newProject);
        }

        setIsProjectFormOpen(false);
        setSelectedProject(null);
    };
    
    const handleEditProject = (project: any) => {
        console.log('test', project)
        setSelectedProject(project);
        setIsProjectFormOpen(true);
    };
        
    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
        setSearchQuery('');

        if (tabId !== 'board') {
            setActiveBoardProjectId(null);
        }
    };
    
    const handleTaskMove = (taskId: string | number, newStatusId: number, newPosition: number) => {
        const updatedProjects = projects.map(project => {
            const taskIndex = project.tasks?.findIndex((t: any) => String(t.id) === String(taskId));

            if (taskIndex !== undefined && taskIndex !== -1) {
                const updatedTasks = [...project.tasks];
                updatedTasks[taskIndex] = {
                    ...updatedTasks[taskIndex],
                    statusId: newStatusId,
                    position: newPosition
                };
                return { ...project, tasks: updatedTasks };
            }
            return project;
        });

        setProjects(updatedProjects);
        
        if (data) {
            data.projects = updatedProjects;
        }
    };
    
    useEffect(() => {
        const handlePopState = () => {
            if (isOpen) onClose();
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [isOpen, onClose]);
    
    if (!isOpen || !data) return null;
    
    useEffect(() => {
        setProjects(data.projects || []);
    }, [data.projects]);
    
    useEffect(() => {
        if (!isOpen) {
            setActiveTab('overview');
            setSearchQuery('');
            setActiveBoardProjectId(null);
        }
    }, [isOpen]);
    
    return (
        <WorkspaceLayout
            data={data}
            activeTab={activeTab}
            tabs={TABS}
            onTabChange={handleTabChange}
            // headerActions={<CloseButton onClose={onClose} />}
        >
            {activeTab === 'overview' && <OverviewTab 
                projects={projects}
            />}

            {activeTab === 'projects' && (
                <ProjectsTab
                    projects={projects}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    data={data}
                    onViewBoard={(projectId) => {
                        setActiveBoardProjectId(projectId);
                        setActiveTab('board');
                    }}    
                    handleEditProject={handleEditProject}
                    handleDeleteProject={handleDeleteProject}
                    setSelectedProject={setSelectedProject}
                    setIsProjectFormOpen={setIsProjectFormOpen}
                />
            )}
      
            {isProjectFormOpen && (
                <ProjectForm
                    isOpen={isProjectFormOpen}
                    onClose={() => {
                        setIsProjectFormOpen(false);
                        setSelectedProject(null);
                    }}
                    onSuccess={handleProjectSuccess}
                    workspaceId={data.id}
                    selectedProject={selectedProject}
                />
            )}
                    
            {activeTab === 'board' && (
                <TaskBoardTab
                    data={data}
                    
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    activeBoardProjectId={activeBoardProjectId}
                    onTaskMove={handleTaskMove}
                />
            )}

            {activeTab === 'members' && (
                <MembersTab 
                    // data={data} 
                    data={{ ...data, members: workspaceMembers }} 
                    userOptions={userOptions}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    onUpdateMembers={handleUpdateMembers}
                />
            )}

            {activeTab === 'settings' && (
                <SettingsTab 
                    data={data}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                />
            )}
  
            <ModalConfirmation 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                loading={isDeleting}
                title="Delete Project"
                message={`Are you sure you want to delete ${selectedProject?.name}?`}
            />
            
        </WorkspaceLayout>
        
        // <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-in fade-in duration-300">
        //     <div className="px-6 py-4 flex justify-between items-center border-b border-slate-100">
        //         <div className="flex items-center gap-3">
        //             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
        //                 <Globe className="text-white" size={16} />
        //             </div>
        //             <span className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
        //                 Workspace / {data.name}
        //             </span>
        //         </div>

        //         <CloseButton onClose={onClose} />
        //     </div>

        //     <div className="bg-slate-50/50 border-b border-slate-100">
        //         <div className="max-w-[2500px] mx-auto px-10 py-8 flex flex-col md:flex-row items-center gap-6">

        //             <div className="relative">
        //                 <div className="h-20 w-20 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-inner">
        //                     {data.name.charAt(0).toUpperCase()}
        //                 </div>
        //             </div>
                    
        //             <div className="flex-1 text-center md:text-left">
        //                 <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{data.name}</h2>
        //                 <div className="flex items-center justify-center md:justify-start gap-3 mt-1 text-sm text-slate-500 font-medium">
        //                     <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[11px] uppercase tracking-wider text-slate-600">
        //                         {data.plan || 'Pro SaaS'}
        //                     </span>
        //                     <span className="flex items-center gap-1">
        //                         <Shield size={14} className="text-slate-400" />
        //                         slug: {data.slug}
        //                     </span>
        //                 </div>
        //             </div>
        //         </div>

        //         <ModalTabs
        //             tabs={TABS} 
        //             activeTab={activeTab} 
        //             // onTabChange={setActiveTab}
        //             onTabChange={handleTabChange}
        //         />
        //     </div>

        //     {/* <div className="flex-1 overflow-y-auto bg-[#F8FAFC]"> */}
        //     {/* <div className={`flex-1 ${activeTab === 'board' ? 'overflow-hidden' : 'overflow-y-auto'} bg-[#F8FAFC]`}> */}
        //     <div className={`flex-1 bg-[#F8FAFC] ${activeTab === 'board' ? 'overflow-hidden' : 'overflow-y-auto'}`}>
        //         <div className={`max-w-[2000px] mx-auto px-10 py-10 transition-all duration-500 ${activeTab === 'board' ? 'h-full' : ''}`}>
        //         {/* <div className="max-w-[2000px] mx-auto px-10 py-10 transition-all duration-500"> */}
                    
        //             {activeTab === 'overview' && <OverviewTab projects={projects} />}
                    
        //             {activeTab === 'projects' && (
        //                 <ProjectsTab
        //                     projects={projects}
        //                     searchQuery={searchQuery}
        //                     setSearchQuery={setSearchQuery}
        //                     data={data}
                            
        //                     onViewBoard={(projectId) => {
        //                         setActiveBoardProjectId(projectId);
        //                         setActiveTab('board');
        //                     }}
                            
        //                     handleEditProject={handleEditProject}
        //                     handleDeleteProject={handleDeleteProject}
        //                     setSelectedProject={setSelectedProject}
        //                     setIsProjectFormOpen={setIsProjectFormOpen}
        //                 />
        //             )}
                    
        //             {isProjectFormOpen && (
        //                 <ProjectForm
        //                     isOpen={isProjectFormOpen}
        //                     onClose={() => {
        //                         setIsProjectFormOpen(false);
        //                         setSelectedProject(null);
        //                     }}
        //                     onSuccess={handleProjectSuccess}
        //                     workspaceId={data.id}
        //                     selectedProject={selectedProject}
        //                 />
        //             )}
                    
        //             {activeTab === 'board' && (
        //                 <TaskBoardTab
        //                     data={data}
        //                     searchQuery={searchQuery}
        //                     setSearchQuery={setSearchQuery}
        //                     activeBoardProjectId={activeBoardProjectId}
        //                     onTaskMove={handleTaskMove}
        //                 />
        //             )}
                    
        //             {activeTab === 'members' && (
        //                 <MembersTab 
        //                     // data={data} 
        //                     data={{ ...data, members: workspaceMembers }} 
        //                     userOptions={userOptions}
        //                     searchQuery={searchQuery}
        //                     setSearchQuery={setSearchQuery}
        //                     onUpdateMembers={handleUpdateMembers}
        //                 />
        //             )}
                    
        //             {activeTab === 'settings' && (
        //                 <SettingsTab 
        //                     data={data}
        //                     searchQuery={searchQuery}
        //                     setSearchQuery={setSearchQuery}
        //                 />
        //             )}
                    
        //             <ModalConfirmation 
        //                 isOpen={isDeleteModalOpen}
        //                 onClose={() => setIsDeleteModalOpen(false)}
        //                 onConfirm={handleConfirmDelete}
        //                 loading={isDeleting}
        //                 title="Delete Project"
        //                 message={`Are you sure you want to delete ${selectedProject?.name}?`}
        //             />
                    
        //         </div>
        //     </div>
        // </div> 
    );
}