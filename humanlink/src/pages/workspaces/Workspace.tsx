import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
// import { 
//     LayoutDashboard, Users, Settings, Kanban, FolderKanban 
// } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Layout & Tabs
import WorkspaceLayout from '@/components/layouts/WorkspaceLayout';
import ProjectsTab from '@/pages/workspaces/tabs/ProjectsTab';
import TaskBoardTab from '@/pages/workspaces/tabs/TaskBoardTab';
import AnalyticsTab from '@/pages/workspaces/tabs/AnalyticsTab';
import SettingsTab from '@/pages/workspaces/tabs/SettingsTab';
import OverviewTab from '@/pages/workspaces/tabs/OverviewTab';
import MembersTab from '@/pages/workspaces/tabs/MembersTab';
import StatusesTab from '@/pages/workspaces/tabs/StatusesTab';
import ProjectForm from '@/pages/projects/ProjectForm';
import TaskForm from '@/pages/tasks/TaskForm';
import ModalConfirmation from '@/components/modals/ModalConfirmation';

import { ProjectService } from '@/services/ProjectService';
import { WorkspaceService } from '@/services/WorkspaceService';
import { StatusService } from '@/services/StatusService';

import { useUsers } from '@/hooks/use-users';
import { useAuth } from '@/context/AuthContext';
import { WORKSPACE_TABS, type WorkspaceTab } from '@/constants/tabs';
import { usePageTitle } from '@/hooks/use-title';
import { useWorkspaces } from '@/hooks/use-workspace';


export default function Workspace() {
    
    const { user } = useAuth();
    const { slug } = useParams<{ slug: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const { userOptions } = useUsers(true);

    const {
        data, setData, 
        projects, setProjects,
        tasks, setTasks,
        workspaceMembers, setWorkspaceMembers, 
        fetchWorkspaceBySlug,
    } = useWorkspaces(true, user, location.state?.workspace);
    // } = useWorkspaces(true, user);
    
    // const workspaceFromState = location.state?.workspace;

    // const [data, setData] = useState<any>(workspaceFromState || null);
    // const [workspaceMembers, setWorkspaceMembers] = useState<any[]>(workspaceFromState?.members || []);
    // const [projects, setProjects] = useState<any[]>(workspaceFromState?.projects || []);
    // const [tasks, setTasks] = useState<any[]>(workspaceFromState?.projects?.flatMap((project: any) => project.tasks) || [])
    
    usePageTitle(data?.name || "Workspace");
    
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeBoardProjectId, setActiveBoardProjectId] = useState<string | null>(null);
    const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<any | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    
    // const [tasks, setTasks] = useState<any[]>(workspaceFromState?.projects?.flatMap((project: any) => project.tasks) || [])
    const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<any | null>(null);
    
    const [statuses, setStatuses] = useState<any[]>([]);
    
    const [activeTab, setActiveTab] = useState<WorkspaceTab['id']>(() => {
        const hash = window.location.hash.replace('#', '') as WorkspaceTab['id'];
        return WORKSPACE_TABS.find(t => t.id === hash) ? hash : 'overview';
    });

    const handleTabChange = (tabId: WorkspaceTab['id']) => {
        setActiveTab(tabId);
        window.location.hash = tabId;
        setSearchQuery('');
        if (tabId !== 'board') setActiveBoardProjectId(null);
    };
    
    const handleProjectSuccess = (newProject: any) => {
        if (selectedProject) {
            setProjects(prev => prev.map(p => p.id === newProject.id ? newProject : p));
        } else {
            setProjects(prev => [newProject, ...prev]);
        }
        setIsProjectFormOpen(false);
        setSelectedProject(null);
    };
    
    const handleEditProject = (project: any) => {
        setSelectedProject(project);
        setIsProjectFormOpen(true);
    };
    
    const handleDeleteProject = (project: any) => {
        setSelectedProject(project);
        setIsDeleteModalOpen(true);
    };
    
    const handleTaskSuccess = (newTask: any) => {
        if (selectedTask) {
            setTasks(prev => prev.map(task => task.id === newTask.id ? newTask : task));
        } else {
            setTasks(prev => [newTask, ...prev]);
        }

        setProjects(prevProjects => prevProjects.map(project => {
            if (project.id === newTask.projectId || project.id === newTask.project_id) {
                const existingTasks = project.tasks || [];
                const taskExists = existingTasks.find((t: any) => t.id === newTask.id);

                return {
                    ...project,
                    tasks: taskExists 
                        ? existingTasks.map((t: any) => t.id === newTask.id ? newTask : t)
                        : [newTask, ...existingTasks]
                };
            }
            return project;
        }));

        setIsTaskFormOpen(false);
        setSelectedTask(null);
    };
    
    const handleEditTask = (task: any) => {
        setSelectedTask(task);
        setIsTaskFormOpen(true);
    };
    
    const handleDeleteTask = (task: any) => {
        setSelectedTask(task);
        setIsDeleteModalOpen(true);
    };
    
    // const handleTaskSuccess = (newTask: any) => {
    //     if (selectedTask) {
    //         setTasks(prev => prev.map(task => task.id === newTask.id ? newTask : task));
    //     } else {
    //         setTasks(prev => [newTask, ...prev]);
    //     }
    //     setIsProjectFormOpen(false);
    //     setSelectedProject(null);
    // };
    
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
    
    const handleTaskMove = (taskId: string | number, newStatusId: number, newPosition: number) => {
        const updatedProjects = projects.map(project => {
            const taskIndex = project.tasks?.findIndex((t) => String(t.id) === String(taskId));

            if (taskIndex !== undefined && taskIndex !== -1) {
                const updatedTasks = [...(project.tasks || [])]; 

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
    };
    
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

    // console.log('Current Data:', data);
    useEffect(() => {
        if (slug) fetchWorkspaceBySlug(slug);
    }, [slug, fetchWorkspaceBySlug]);

    useEffect(() => {
        const syncTabWithHash = () => {
            const hash = window.location.hash.replace('#', '') as WorkspaceTab['id'];
            if (hash && WORKSPACE_TABS.some(t => t.id === hash)) {
                setActiveTab(hash);
            }
        };

        window.addEventListener('hashchange', syncTabWithHash);
        return () => window.removeEventListener('hashchange', syncTabWithHash);
    }, []);
    
    useEffect(() => {
        const fetchStatuses = async () => {
            if (data?.id) {
                try {
                    const response = await StatusService.getWorkspaceStatuses(data.id);
                    // console.log('darrrrr', response)
                    setStatuses(response);
                } catch (err) {
                    console.error("Failed to fetch statuses", err);
                }
            }
        };

        fetchStatuses();
    }, [data?.id]);

    // if (!data && loading) return <div className="p-10 text-center font-bold">Loading Workspace...</div>;
    if (!data) return null;

    return (
        <WorkspaceLayout 
            data={data}
            activeTab={activeTab}
            tabs={WORKSPACE_TABS} 
            onTabChange={handleTabChange}
        >
            {activeTab === 'overview' && (
                <OverviewTab projects={projects} />
            )}
            
            {activeTab === 'projects' && (
                <ProjectsTab
                    projects={projects}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    data={data}
                    onViewBoard={(id) => {
                        setActiveBoardProjectId(id);
                        setActiveTab('board');
                    }}
                    handleEditProject={handleEditProject}
                    handleDeleteProject={handleDeleteProject}
                    setSelectedProject={setSelectedProject}
                    setIsProjectFormOpen={setIsProjectFormOpen}
                />
            )}
            
            {activeTab === 'board' && (
                <TaskBoardTab
                    // data={data}
                    data={{ ...data, projects: projects }}
                    // data={projects}
                    // taskStatuses={data.taskStatuses}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    activeBoardProjectId={activeBoardProjectId}
                    setActiveBoardProjectId={setActiveBoardProjectId}
                    onTaskMove={handleTaskMove}
                    
                    handleEditTask={handleEditTask}
                    handleDeleteTask={handleDeleteTask}
                    
                    setIsTaskFormOpen={setIsTaskFormOpen}
                    setSelectedTask={setSelectedTask}
                />
            )}
            
            {activeTab === 'analytics' && (
                
                <AnalyticsTab 
                    workspace={data}
                />
            )}
            
            {activeTab === 'members' && (
                <MembersTab
                    data={{ ...data, members: workspaceMembers }} 
                    userOptions={userOptions}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    onUpdateMembers={handleUpdateMembers}
                />
            )}
            
            {activeTab === 'statuses' && (
                <StatusesTab 
                    data={data}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                />
            )}
            
            {activeTab === 'settings' && (
                <SettingsTab 
                    data={data}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                />
            )}

            {isProjectFormOpen && (
                <ProjectForm
                    isOpen={isProjectFormOpen}
                    onClose={() => setIsProjectFormOpen(false)}
                    onSuccess={handleProjectSuccess}
                    workspaceId={data.id}
                    selectedProject={selectedProject}
                />
            )}
            
            {isTaskFormOpen && (
                <TaskForm
                    isOpen={isTaskFormOpen}
                    onClose={() => setIsTaskFormOpen(false)}
                    onSuccess={handleTaskSuccess}
                    selectedTask={selectedTask}
                    projectId={data?.id}
                    statuses={statuses}
                    tasks={tasks}
                    // TODO: fetch data of statuses base on workspace id
                    // statusId={1}
                    statusId={selectedTask?.status_id || statuses[0]?.id || 1}
                    // statusId={activeStatusId}
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
    );
}
