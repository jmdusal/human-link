import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
// import { 
//     LayoutDashboard, Users, Settings, Kanban, FolderKanban 
// } from 'lucide-react';
import { toast } from 'react-hot-toast';
import WorkspaceLayout from '@/components/layouts/WorkspaceLayout';

import ProjectsTab from '@/pages/workspaces/tabs/ProjectsTab';
import TaskBoardTab from '@/pages/workspaces/tabs/TaskBoardTab';
import AnalyticsTab from '@/pages/workspaces/tabs/AnalyticsTab';
import SettingsTab from '@/pages/workspaces/tabs/SettingsTab';
import OverviewTab from '@/pages/workspaces/tabs/OverviewTab';
import MembersTab from '@/pages/workspaces/tabs/MembersTab';
import StatusesTab from '@/pages/workspaces/tabs/StatusesTab';
import TagsTab from '@/pages/workspaces/tabs/TagsTab';
import ProjectForm from '@/pages/projects/ProjectForm';
import TaskForm from '@/pages/tasks/TaskForm';
import StatusForm from '@/pages/statuses/StatusForm';
import TagForm from '@/pages/tags/TagForm';
import ModalConfirmation from '@/components/modals/ModalConfirmation';

import { ProjectService } from '@/services/ProjectService';
import { WorkspaceService } from '@/services/WorkspaceService';
import { StatusService } from '@/services/StatusService';

import { useUsers } from '@/hooks/use-users';
import { useAuth } from '@/context/AuthContext';
import { WORKSPACE_TABS, type WorkspaceTab } from '@/constants/tabs';
import { usePageTitle } from '@/hooks/use-title';
import { useWorkspaces } from '@/hooks/use-workspace';
import { TaskService } from '@/services/TaskService';
import type { Status } from '@/types';
import { TagService } from '@/services/TagService';


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
        statuses, setStatuses,
        tags, setTags,
        fetchWorkspaceBySlug,
    } = useWorkspaces(true, user, location.state?.workspace);
    // } = useWorkspaces(true, user);
    
    // const workspaceFromState = location.state?.workspace;

    // const [data, setData] = useState<any>(workspaceFromState || null);
    // const [workspaceMembers, setWorkspaceMembers] = useState<any[]>(workspaceFromState?.members || []);
    // const [projects, setProjects] = useState<any[]>(workspaceFromState?.projects || []);
    // const [tasks, setTasks] = useState<any[]>(workspaceFromState?.projects?.flatMap((project: any) => project.tasks) || [])
    
    usePageTitle(data?.name || "Workspace");
    
    
    // const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeBoardProjectId, setActiveBoardProjectId] = useState<number | null>(null);
    const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<any | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    
    const [deleteType, setDeleteType] = useState<'project' | 'status'| 'tag' | 'task' | null>(null);
    
    // const [tasks, setTasks] = useState<any[]>(workspaceFromState?.projects?.flatMap((project: any) => project.tasks) || [])
    const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<any | null>(null);

    const [isStatusFormOpen, setIsStatusFormOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<any | null>(null);
    
    const [isTagFormOpen, setIsTagFormOpen] = useState(false);
    const [selectedTag, setSelectedTag] = useState<any | null>(null);

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
            setProjects(prev => prev.map(project => project.id === newProject.id ? newProject : project));
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
        setDeleteType('project');
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
        setDeleteType('task');
        setSelectedTask(task);
        setIsDeleteModalOpen(true);
    };
    
    const handleStatusSuccess = (newStatus: any) => {
        if (selectedStatus) {
            setStatuses(prev => prev.map(status => status.id === newStatus.id ? newStatus : status));
        } else {
            setStatuses(prev => [...prev, newStatus]);
        }
        setIsStatusFormOpen(false);
        setSelectedStatus(null);
    };

    const handleEditStatus = (status: any) => {
        setSelectedStatus(status);
        setIsStatusFormOpen(true);
    };
    
    const handleDeleteStatus = (status: any) => {
        setDeleteType('status');
        setSelectedStatus(status);
        setIsDeleteModalOpen(true);
    };
    
    const handleTagSuccess = (newTag: any) => {
        if (selectedTag) {
            setTags(prev => prev.map(tag => tag.id === newTag.id ? newTag : tag));
        } else {
            setTags(prev => [...prev, newTag]);
        }
        setIsTagFormOpen(false);
        setSelectedTag(null);
    }
    
    const handleEditTag = (tag: any) => {
        setSelectedTag(tag);
        setIsTagFormOpen(true);
    };
    
    const handleDeleteTag = (tag: any) => {
        setDeleteType('tag');
        setSelectedTag(tag);
        setIsDeleteModalOpen(true);
    };
    
    const handleReorderSuccess = (newList: any[]) => {
        const sanitizedList = newList.map((item, index) => ({
            ...item,
            position: index
        }));

        setStatuses(sanitizedList);
    };
    
    // const handleReorderSuccess = (newList: any[]) => {
    //     setStatuses([...newList]);
    // };
    
    const handleConfirmDelete = async () => {
        if (!deleteType) return;
        setIsDeleting(true);

        try {
            if (deleteType === 'project' && selectedProject) {
                await ProjectService.deleteProject(selectedProject.id);
                setProjects(prev => prev.filter(p => p.id !== selectedProject.id));
                toast.success("Project deleted successfully");
            }
            
            // else if (deleteType === 'task' && selectedTask) {
            //     await TaskService.deleteTask(selectedTask.id);
            //     setTasks(prev => prev.filter(task => task.id !== selectedTask.id));
            //     toast.success("Task deleted successfully");
            // }
            
            else if (deleteType === 'task' && selectedTask) {
                await TaskService.deleteTask(selectedTask.id);

                setTasks(prev => prev.filter(task => task.id !== selectedTask.id));
                setProjects(prevProjects => prevProjects.map(project => {
                    if (project.id === selectedTask.projectId || project.id === selectedTask.project_id) {
                        return {
                            ...project,
                            tasks: (project.tasks || []).filter((t: any) => t.id !== selectedTask.id)
                        };
                    }
                    return project;
                }));

                toast.success("Task deleted successfully");
            }
            
            else if (deleteType === 'status' && selectedStatus) {
                await StatusService.deleteStatus(selectedStatus.id);
                
                setStatuses(prev => 
                    prev
                        .filter(s => s.id !== selectedStatus.id)
                        .sort((a, b) => a.position - b.position)
                        .map((s, index) => ({ ...s, position: index }))
                );
                // setStatuses(prev => prev.filter(s => s.id !== selectedStatus.id));
                toast.success("Status deleted successfully");
            }
            
            if (deleteType === 'tag' && selectedTag) {
                await TagService.deleteTag(selectedTag.id);
                setTags(prev => prev.filter(tag => tag.id !== selectedTag.id));
                toast.success("Tag deleted successfully");
            }
            
            setIsDeleteModalOpen(false);
            setDeleteType(null);
        } catch (error) {
            toast.error("Failed to delete");
        } finally {
            setIsDeleting(false);
        }
    };
    
    // const handleConfirmDelete = async () => {
    //     if (!selectedProject) return;
    //     setIsDeleting(true);
    //     try {
    //         await ProjectService.deleteProject(selectedProject.id);
    //         const updatedProjects = projects.filter(p => p.id !== selectedProject.id);
    //         setProjects(updatedProjects);
    //         data.projects = updatedProjects;
    //         toast.success('Project deleted successfully.');
    //         setIsDeleteModalOpen(false);
    //     } catch (err) {
    //         toast.error('Failed to delete project.');
    //     } finally {
    //         setIsDeleting(false);
    //         setSelectedProject(null);
    //     }
    // };
    
    const handleTaskMove = (taskId: string | number, newStatusId: number, newPosition: number) => {
        const updatedProjects = projects.map(project => {
            const taskIndex = project.tasks?.findIndex((task) => String(task.id) === String(taskId));

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
                    statuses={statuses}
                    tags={tags}
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
                    statuses={statuses}
                    data={data}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    handleEditStatus={handleEditStatus}
                    handleDeleteStatus={handleDeleteStatus}
                    setSelectedStatus={setSelectedStatus}
                    setIsStatusFormOpen={setIsStatusFormOpen}
                    onSuccess={handleReorderSuccess}
                />
            )}
            
            {activeTab === 'tags' && (
                <TagsTab
                    tags={tags}
                    data={data}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    handleEditTag={handleEditTag}
                    handleDeleteTag={handleDeleteTag}
                    setSelectedTag={setSelectedTag}
                    setIsTagFormOpen={setIsTagFormOpen}
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
                    tags={tags}
                    tasks={tasks}
                    // TODO: fetch data of statuses base on workspace id
                    // statusId={1}
                    statusId={selectedTask?.statusId || statuses[0]?.id || 1}
                    // statusId={activeStatusId}
                />
            )}
            
            {isStatusFormOpen && (
                <StatusForm
                    isOpen={isStatusFormOpen}
                    onClose={() => setIsStatusFormOpen(false)}
                    onSuccess={handleStatusSuccess}
                    workspaceId={data.id}
                    selectedStatus={selectedStatus}
                    currentCount={statuses.length}
                    existingStatuses={statuses}
                />
            )}
            
            {isTagFormOpen && (
                <TagForm
                    isOpen={isTagFormOpen}
                    onClose={() => setIsTagFormOpen(false)}
                    onSuccess={handleTagSuccess}
                    workspaceId={data.id}
                    selectedTag={selectedTag}
                />
            )}
            
            <ModalConfirmation
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setDeleteType(null);
                }}
                onConfirm={handleConfirmDelete}
                loading={isDeleting}
                title={`Delete ${deleteType}`}
                message={`Are you sure you want to delete "${
                    deleteType === 'project'
                        ? selectedProject?.name
                        : deleteType === 'task'
                        ? selectedTask?.title
                        : deleteType === 'tag'
                        ? selectedTag?.name  
                        : selectedStatus?.name
                }"? This action cannot be undone.`}
            />
            
            {/* <ModalConfirmation
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setDeleteType(null);
                }}
                onConfirm={handleConfirmDelete}
                loading={isDeleting}
                title={`Delete ${deleteType}`}
                message={`Are you sure you want to delete "${deleteType === 'project' ? selectedProject?.name : selectedStatus?.name
                }"? This action cannot be undone.`}
            /> */}

            {/* <ModalConfirmation
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                loading={isDeleting}
                title="Delete"
                message={`Are you sure you want to delete ${selectedProject?.name}?`}
            /> */}
            
        </WorkspaceLayout>
    );
}
