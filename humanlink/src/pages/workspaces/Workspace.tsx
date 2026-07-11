import { useState, useEffect, useMemo } from 'react';
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
import { WORKSPACE_PRIMARY_TABS, WORKSPACE_TABS, type WorkspaceTab } from '@/constants/tabs';
import { usePageTitle } from '@/hooks/use-title';
import { useWorkspaces } from '@/hooks/use-workspace';
import { TaskService } from '@/services/TaskService';
import type { Status } from '@/types';
import { TagService } from '@/services/TagService';
import { useWorkspacePermissions } from '@/utils/workspacePermissions';


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
    
    const [deleteType, setDeleteType] = useState<'project' | 'status'| 'tag' | 'task' | 'workspace' | 'workspace-delete' | 'leave' | null>(null);
    const [isSavingSettings, setIsSavingSettings] = useState(false);
    const [isTransferringOwnership, setIsTransferringOwnership] = useState(false);
    
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
    };
    
    const handleProjectSuccess = (newProject: any) => {
        if (selectedProject) {
            setProjects(prev => prev.map(project => project.id === newProject.id ? newProject : project));
        } else {
            setProjects(prev => [newProject, ...prev]);
        }

        if (newProject.workspace?.statuses) {
            setStatuses(newProject.workspace.statuses);
        }
        if (newProject.workspace?.tags) {
            setTags(newProject.workspace.tags);
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
        setTasks((prev) => {
            const exists = prev.some((task) => task.id === newTask.id);
            return exists
                ? prev.map((task) => (task.id === newTask.id ? newTask : task))
                : [newTask, ...prev];
        });

        setProjects((prevProjects) => prevProjects.map((project) => {
            if (project.id === newTask.projectId || project.id === newTask.project_id) {
                const existingTasks = project.tasks || [];
                const taskExists = existingTasks.find((t: any) => t.id === newTask.id);

                return {
                    ...project,
                    tasks: taskExists
                        ? existingTasks.map((t: any) => (t.id === newTask.id ? newTask : t))
                        : [newTask, ...existingTasks],
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
            if (deleteType === 'workspace') {
                await WorkspaceService.archiveWorkspace(data.id);
                toast.success('Workspace archived');
                navigate('/workspaces');
                return;
            }

            if (deleteType === 'workspace-delete') {
                await WorkspaceService.deleteWorkspace(data.id);
                toast.success('Workspace deleted');
                navigate('/workspaces');
                return;
            }

            if (deleteType === 'leave') {
                await WorkspaceService.leaveWorkspace(data.id);
                toast.success('You left the workspace');
                navigate('/workspaces');
                return;
            }

            if (deleteType === 'project' && selectedProject) {
                await ProjectService.archiveProject(selectedProject.id);
                setProjects(prev => prev.filter(p => p.id !== selectedProject.id));
                toast.success('Project archived');
            } else if (deleteType === 'task' && selectedTask) {
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
            } else if (deleteType === 'status' && selectedStatus) {
                await StatusService.deleteStatus(selectedStatus.id);

                setStatuses(prev =>
                    prev
                        .filter(s => s.id !== selectedStatus.id)
                        .sort((a, b) => a.position - b.position)
                        .map((s, index) => ({ ...s, position: index }))
                );
                toast.success("Status deleted successfully");
            } else if (deleteType === 'tag' && selectedTag) {
                await TagService.deleteTag(selectedTag.id);
                setTags(prev => prev.filter(tag => tag.id !== selectedTag.id));
                toast.success("Tag deleted successfully");
            }

            setIsDeleteModalOpen(false);
            setDeleteType(null);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to delete');
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
    
    const syncWorkspaceMembers = (updated: any) => {
        setData((prev: any) => prev ? { ...prev, ...updated, members: updated.members || [] } : updated);
        setWorkspaceMembers(updated.members || []);
    };

    const handleInviteMembers = async (userIds: number[]) => {
        try {
            let updated = data;
            for (const userId of userIds) {
                updated = await WorkspaceService.inviteMember(data.id, userId);
            }
            syncWorkspaceMembers(updated);
            toast.success(userIds.length > 1 ? 'Invitations sent.' : 'Invitation sent.');
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to invite member.');
        }
    };

    const handleRemoveMember = async (userId: number) => {
        try {
            const updated = await WorkspaceService.removeMember(data.id, userId);
            syncWorkspaceMembers(updated);
            toast.success('Member removed.');
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to remove member.');
        }
    };

    const handleChangeMemberRole = async (userId: number, role: 'admin' | 'member') => {
        try {
            const updated = await WorkspaceService.changeMemberRole(data.id, userId, role);
            syncWorkspaceMembers(updated);
            toast.success('Role updated.');
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to update role.');
        }
    };

    const handleResendInvitation = async (userId: number) => {
        try {
            const updated = await WorkspaceService.resendInvitation(data.id, userId);
            syncWorkspaceMembers(updated);
            toast.success('Invitation resent.');
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to resend invitation.');
        }
    };

    const handleCancelInvitation = async (userId: number) => {
        try {
            const updated = await WorkspaceService.cancelInvitation(data.id, userId);
            syncWorkspaceMembers(updated);
            toast.success('Invitation cancelled.');
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to cancel invitation.');
        }
    };

    const handleRenameWorkspace = async (name: string) => {
        setIsSavingSettings(true);
        try {
            const updated = await WorkspaceService.saveWorkspace({ name }, data.id);
            setData((prev: any) => prev ? { ...prev, ...updated } : updated);
            toast.success('Workspace renamed.');
            if (updated.slug && updated.slug !== slug) {
                navigate(`/workspaces/${updated.slug}#settings`, { replace: true });
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to rename workspace.');
        } finally {
            setIsSavingSettings(false);
        }
    };

    const handleTransferOwnership = async (userId: number) => {
        setIsTransferringOwnership(true);
        try {
            const updated = await WorkspaceService.transferOwnership(data.id, userId);
            setData((prev: any) => prev ? { ...prev, ...updated } : updated);
            if (updated.members) {
                setWorkspaceMembers(updated.members);
            }
            toast.success('Ownership transferred.');
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to transfer ownership.');
        } finally {
            setIsTransferringOwnership(false);
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

    const workspaceWithMembers = useMemo(
        () => (data ? { ...data, members: workspaceMembers } : null),
        [data, workspaceMembers],
    );
    const { filterProjects } = useWorkspacePermissions(workspaceWithMembers);
    const visibleProjects = useMemo(
        () => filterProjects(projects),
        [filterProjects, projects],
    );

    if (!data || !workspaceWithMembers) return null;

    return (
        <WorkspaceLayout 
            data={workspaceWithMembers}
            activeTab={activeTab}
            tabs={WORKSPACE_PRIMARY_TABS}
            onTabChange={handleTabChange}
        >
            {activeTab === 'overview' && (
                <OverviewTab workspace={{ ...workspaceWithMembers, statuses }} projects={visibleProjects} />
            )}
            
            {activeTab === 'projects' && (
                <ProjectsTab
                    projects={visibleProjects}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    data={workspaceWithMembers}
                    onViewBoard={(id) => {
                        setActiveBoardProjectId(id);
                        setActiveTab('board');
                        window.location.hash = 'board';
                        setSearchQuery('');
                    }}
                    handleEditProject={handleEditProject}
                    handleDeleteProject={handleDeleteProject}
                    setSelectedProject={setSelectedProject}
                    setIsProjectFormOpen={setIsProjectFormOpen}
                />
            )}
            
            {activeTab === 'board' && (
                <TaskBoardTab
                    data={{ ...workspaceWithMembers, projects: visibleProjects }}
                    statuses={statuses}
                    tags={tags}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    activeBoardProjectId={activeBoardProjectId}
                    setActiveBoardProjectId={setActiveBoardProjectId}
                    onTaskMove={handleTaskMove}
                    handleEditTask={handleEditTask}
                    handleDeleteTask={handleDeleteTask}
                    setIsTaskFormOpen={setIsTaskFormOpen}
                    setSelectedTask={setSelectedTask}
                    onTaskUpdate={handleTaskSuccess}
                />
            )}
            
            {activeTab === 'analytics' && (
                <AnalyticsTab
                    workspace={{ ...workspaceWithMembers, statuses, projects: visibleProjects }}
                    projects={visibleProjects}
                />
            )}

            {activeTab === 'members' && (
                <MembersTab
                    data={workspaceWithMembers}
                    userOptions={userOptions}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    onInviteMembers={handleInviteMembers}
                    onRemoveMember={handleRemoveMember}
                    onChangeMemberRole={handleChangeMemberRole}
                    onResendInvitation={handleResendInvitation}
                    onCancelInvitation={handleCancelInvitation}
                />
            )}
            
            {activeTab === 'statuses' && (
                <StatusesTab
                    statuses={statuses}
                    data={workspaceWithMembers}
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
                    data={workspaceWithMembers}
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
                    data={workspaceWithMembers}
                    saving={isSavingSettings}
                    transferring={isTransferringOwnership}
                    onRename={handleRenameWorkspace}
                    onArchive={() => {
                        setDeleteType('workspace');
                        setIsDeleteModalOpen(true);
                    }}
                    onDelete={() => {
                        setDeleteType('workspace-delete');
                        setIsDeleteModalOpen(true);
                    }}
                    onLeave={() => {
                        setDeleteType('leave');
                        setIsDeleteModalOpen(true);
                    }}
                    onTransferOwnership={handleTransferOwnership}
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
            
            {isTaskFormOpen && activeBoardProjectId && (
                <TaskForm
                    isOpen={isTaskFormOpen}
                    onClose={() => setIsTaskFormOpen(false)}
                    onSuccess={handleTaskSuccess}
                    selectedTask={selectedTask}
                    projectId={selectedTask?.projectId || activeBoardProjectId}
                    statuses={statuses}
                    tags={tags}
                    tasks={tasks.filter((task) =>
                        (task.projectId || (task as any).project_id) === (selectedTask?.projectId || activeBoardProjectId)
                    )}
                    statusId={selectedTask?.statusId || statuses[0]?.id || 1}
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
                title={
                    deleteType === 'leave'
                        ? 'Leave workspace'
                        : deleteType === 'workspace'
                        ? 'Archive workspace'
                        : deleteType === 'workspace-delete'
                        ? 'Delete workspace'
                        : deleteType === 'project'
                        ? 'Archive project'
                        : `Delete ${deleteType}`
                }
                message={
                    deleteType === 'leave'
                        ? `Leave "${data.name}"? You will lose access until invited again.`
                        : deleteType === 'workspace'
                        ? `Archive "${data.name}"? It will be hidden from your workspace list. You can restore it later.`
                        : deleteType === 'workspace-delete'
                        ? `Permanently delete "${data.name}"? Projects, tasks, statuses, and tags will be removed. This cannot be undone.`
                        : deleteType === 'project'
                        ? `Archive "${selectedProject?.name}"? It will be hidden from this workspace until restored.`
                        : `Are you sure you want to delete "${
                            deleteType === 'task'
                                ? selectedTask?.title
                                : deleteType === 'tag'
                                ? selectedTag?.name
                                : selectedStatus?.name
                        }"? This action cannot be undone.`
                }
            />
            
        </WorkspaceLayout>
    );
}
