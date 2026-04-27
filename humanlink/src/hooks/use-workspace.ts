// import { WorkspaceMember } from './../types/WorkspaceMember';
import { useState, useEffect, useCallback } from 'react';
import { WorkspaceService } from '@/services/WorkspaceService';
import type { Workspace, Project, Task, Status, Tag } from '@/types';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';


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
    
    const fetchWorkspaceBySlug = useCallback(async (slug: string) => {
        if (!data) setLoading(true);

        try {
            const response = await WorkspaceService.getWorkspaceBySlug(slug);
            
            const isMember = response.members?.some((m: any) => m.id === user?.id);
            if (!isMember) {
                toast.error("You are not a member of this workspace.", { id: 'denied' });
                navigate('/workspaces'); 
                return;
            }
            
            // console.log('test test data', response)
            
            const projectsData = response.projects || [];
            const allTasks = projectsData.flatMap((project: any) => project.tasks || []);
            const allAssignees = allTasks.flatMap((task: any) => task.assignees || []);
            const uniqueAssignees = Array.from(new Map(allAssignees.map((a: any) => [a.id, a])).values());
            
            // setProjects(response.projects || []);
            setData(response);
            setProjects(projectsData);
            setTasks(allTasks);
            setTaskAssigness(uniqueAssignees);
            setWorkspaceMembers(response.members || []);
            setStatuses(response.statuses || []);
            setTags(response.tags || []);
        } catch (err) {
            // TODO: 404 pages : or create workspace slug route validator
            toast.error("Workspace not found");
            
            navigate('/workspaces');
        } finally {
            setLoading(false);
        }
    }, [user?.id, navigate]);

    useEffect(() => {
        if (shouldFetch && !slug) {
            fetchWorkspaces();
        }
    }, [shouldFetch, fetchWorkspaces]);
    
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

    // return { 
    //     workspaces,
    //     workspace,
    //     loading,
    //     setWorkspaces,
    //     setWorkspace,
    //     fetchWorkspaces,
    //     fetchWorkspaceBySlug
    // };
}