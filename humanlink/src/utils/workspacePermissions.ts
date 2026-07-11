import { useAuth } from '@/context/AuthContext';
import { useCallback, useMemo } from 'react';

export type WorkspaceRole = 'owner' | 'admin' | 'member';

type MemberLike = {
    id?: number;
    pivot?: { role?: string; status?: string };
};

type WorkspaceLike = {
    ownerId?: number;
    owner_id?: number;
    members?: MemberLike[];
};

/**
 * Workspace role ACL:
 * - super-admin: full access to every workspace (even if not a member)
 * - owner: everything in the workspace (including archive, transfer + hard delete)
 * - admin: manage content (members, projects, statuses, tags, create/delete tasks,
 *          rename) — not archive, transfer ownership, or hard-delete; can leave
 * - member: update tasks only (including board moves) — no create/delete task,
 *           no manage projects/statuses/tags/members/settings; can leave
 */
export function getWorkspaceRole(
    workspace: WorkspaceLike | null | undefined,
    userId?: number | null,
): WorkspaceRole | null {
    if (!workspace || !userId) return null;

    const membership = (workspace.members || []).find(
        (member) =>
            member.id === userId
            && (member.pivot?.status ?? 'accepted') === 'accepted'
    );

    const role = membership?.pivot?.role;
    if (role === 'owner' || role === 'admin' || role === 'member') {
        return role;
    }

    if (workspace.ownerId === userId || workspace.owner_id === userId) {
        return 'owner';
    }

    return null;
}

export function isWorkspaceOwner(
    workspace: WorkspaceLike | null | undefined,
    userId?: number | null,
    isSuperAdmin = false,
): boolean {
    if (isSuperAdmin) return true;
    return getWorkspaceRole(workspace, userId) === 'owner';
}

export function isWorkspaceAdminOrOwner(
    workspace: WorkspaceLike | null | undefined,
    userId?: number | null,
    isSuperAdmin = false,
): boolean {
    if (isSuperAdmin) return true;
    const role = getWorkspaceRole(workspace, userId);
    return role === 'owner' || role === 'admin';
}

export function isAcceptedWorkspaceMember(
    workspace: WorkspaceLike | null | undefined,
    userId?: number | null,
    isSuperAdmin = false,
): boolean {
    if (isSuperAdmin) return true;
    return getWorkspaceRole(workspace, userId) !== null;
}

export function canManageWorkspaceContent(
    workspace: WorkspaceLike | null | undefined,
    userId?: number | null,
    isSuperAdmin = false,
): boolean {
    return isWorkspaceAdminOrOwner(workspace, userId, isSuperAdmin);
}

export function canCreateOrDeleteTasks(
    workspace: WorkspaceLike | null | undefined,
    userId?: number | null,
    isSuperAdmin = false,
): boolean {
    return isWorkspaceAdminOrOwner(workspace, userId, isSuperAdmin);
}

export function canUpdateTasks(
    workspace: WorkspaceLike | null | undefined,
    userId?: number | null,
    isSuperAdmin = false,
): boolean {
    return isAcceptedWorkspaceMember(workspace, userId, isSuperAdmin);
}

export function isAssignedToProject(
    project: { projectMembers?: Array<{ id?: number }> } | null | undefined,
    userId?: number | null,
): boolean {
    if (!userId || !project?.projectMembers) return false;
    return project.projectMembers.some((member) => member.id === userId);
}

/** Members only see projects they are assigned to; owner/admin/super-admin see all. */
export function filterProjectsForViewer<T extends { projectMembers?: Array<{ id?: number }> }>(
    projects: T[],
    workspace: WorkspaceLike | null | undefined,
    userId?: number | null,
    isSuperAdmin = false,
): T[] {
    if (isSuperAdmin || isWorkspaceAdminOrOwner(workspace, userId, isSuperAdmin)) {
        return projects;
    }

    return projects.filter((project) => isAssignedToProject(project, userId));
}

/** Hook: workspace ACL flags with super-admin bypass matching the API. */
export function useWorkspacePermissions(workspace: WorkspaceLike | null | undefined) {
    const { user, hasRole } = useAuth();
    const isSuperAdmin = hasRole('super-admin');
    const userId = user?.id;

    const role = useMemo(() => getWorkspaceRole(workspace, userId), [workspace, userId]);
    const isOwner = useMemo(
        () => isWorkspaceOwner(workspace, userId, isSuperAdmin),
        [workspace, userId, isSuperAdmin],
    );
    const isAdminOrOwner = useMemo(
        () => isWorkspaceAdminOrOwner(workspace, userId, isSuperAdmin),
        [workspace, userId, isSuperAdmin],
    );
    const isMember = useMemo(
        () => isAcceptedWorkspaceMember(workspace, userId, isSuperAdmin),
        [workspace, userId, isSuperAdmin],
    );
    const canManage = useMemo(
        () => canManageWorkspaceContent(workspace, userId, isSuperAdmin),
        [workspace, userId, isSuperAdmin],
    );
    const canCreateOrDelete = useMemo(
        () => canCreateOrDeleteTasks(workspace, userId, isSuperAdmin),
        [workspace, userId, isSuperAdmin],
    );
    const canEditTasks = useMemo(
        () => canUpdateTasks(workspace, userId, isSuperAdmin),
        [workspace, userId, isSuperAdmin],
    );
    const canLeave = Boolean(role) && role !== 'owner';

    const filterProjects = useCallback(
        <T extends { projectMembers?: Array<{ id?: number }> }>(projectList: T[]) =>
            filterProjectsForViewer(projectList, workspace, userId, isSuperAdmin),
        [workspace, userId, isSuperAdmin],
    );

    return {
        isSuperAdmin,
        role,
        isOwner,
        isAdminOrOwner,
        isMember,
        canManage,
        canCreateOrDeleteTasks: canCreateOrDelete,
        canUpdateTasks: canEditTasks,
        canLeave,
        filterProjects,
    };
}
