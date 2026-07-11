import { useState, useEffect, useCallback } from 'react';
import { WorkspaceService } from '@/services/WorkspaceService';
import { TaskService } from '@/services/TaskService';
import type { Workspace, Project, Task, Status, Tag } from '@/types';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function userHasRole(user: any, role: string): boolean {
    if (!user?.roles || !Array.isArray(user.roles)) return false;

    return user.roles.some((entry: unknown) => {
        if (typeof entry === 'string') return entry === role;
        if (entry && typeof entry === 'object' && 'name' in entry) {
            return (entry as { name?: string }).name === role;
        }
        return false;
    });
}

function isAcceptedMember(workspace: any, userId?: number): boolean {
    if (!userId) return false;

    return (workspace.members || []).some(
        (member: any) =>
            member.id === userId
            && (member.pivot?.status ?? 'accepted') === 'accepted'
    );
}

function nestTasksIntoProjects(projects: Project[], tasks: Task[]): Project[] {
    const tasksByProject = new Map<number, Task[]>();

    for (const task of tasks) {
        const projectId = Number((task as any).projectId ?? (task as any).project_id);
        if (!projectId) continue;

        const bucket = tasksByProject.get(projectId) ?? [];
        bucket.push(task);
        tasksByProject.set(projectId, bucket);
    }

    return projects.map((project) => ({
        ...project,
        tasks: tasksByProject.get(project.id) ?? [],
    }));
}

export const useWorkspaces = (shouldFetch: boolean, user?: any, slug?: string) => {
    const navigate = useNavigate();
    
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    
    const [data, setData] = useState<any>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [taskAssignees, setTaskAssigness] = useState<Task[]>([]);
    const [workspaceMembers, setWorkspaceMembers] = useState<any[]>([]);
    const [statuses, setStatuses] = useState<Status[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(false);
    
    
    const fetchWorkspaces = useCallback(async () => {
        setLoading(true);
        try {
            const data = await WorkspaceService.getAllWorkspaces();
            setWorkspaces(data);
        } catch (err) {
            console.error("Workspace Load Error:", err);
        } finally {
            setLoading(false);
        }
    }, []);
    
    const fetchWorkspaceBySlug = useCallback(async (workspaceSlug: string) => {
        if (!data) setLoading(true);

        try {
            const response = await WorkspaceService.getWorkspaceBySlug(workspaceSlug);
            const isSuperAdmin = userHasRole(user, 'super-admin');

            // Super-admin can open any workspace without membership.
            if (!isSuperAdmin && !isAcceptedMember(response, user?.id)) {
                toast.error("You are not a member of this workspace.", { id: 'denied' });
                navigate('/workspaces'); 
                return;
            }

            const projectsData = response.projects || [];
            const tasksData = await TaskService.getByWorkspace(response.id);
            const projectsWithTasks = nestTasksIntoProjects(projectsData, tasksData);
            const allAssignees = tasksData.flatMap((task: any) => task.assignees || []);
            const uniqueAssignees = Array.from(new Map(allAssignees.map((a: any) => [a.id, a])).values());
            
            setData({ ...response, projects: projectsWithTasks });
            setProjects(projectsWithTasks);
            setTasks(tasksData);
            setTaskAssigness(uniqueAssignees);
            setWorkspaceMembers(response.members || []);
            setStatuses(response.statuses || []);
            setTags(response.tags || []);
        } catch (err) {
            toast.error("Workspace not found");
            
            navigate('/workspaces');
        } finally {
            setLoading(false);
        }
    }, [user, navigate]);

    useEffect(() => {
        if (shouldFetch && !slug) {
            fetchWorkspaces();
        }
    }, [shouldFetch, slug, fetchWorkspaces]);
    
    return { 
        data, setData,
        projects, setProjects,
        tasks, setTasks,
        taskAssignees, setTaskAssigness,
        workspaceMembers, setWorkspaceMembers,
        statuses, setStatuses,
        tags, setTags,
        workspaces, setWorkspaces,
        loading,
        fetchWorkspaceBySlug
    };
}
