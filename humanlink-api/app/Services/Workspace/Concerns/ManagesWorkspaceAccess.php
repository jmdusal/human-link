<?php

declare(strict_types=1);

namespace App\Services\Workspace\Concerns;

use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceUser;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

trait ManagesWorkspaceAccess
{
    protected function isSuperAdmin(?User $user = null): bool
    {
        $user ??= Auth::user();

        return $user?->hasRole('super-admin') ?? false;
    }

    protected function workspaceRoleFor(Workspace $workspace, ?User $user = null): ?string
    {
        $user ??= Auth::user();

        if (! $user) {
            return null;
        }

        $member = $workspace->members->first(
            fn (User $member) => $member->id === $user->id
                && ($member->pivot->status ?? WorkspaceUser::STATUS_ACCEPTED) === WorkspaceUser::STATUS_ACCEPTED
        ) ?? $workspace->acceptedMembers()->where('users.id', $user->id)->first();

        return $member?->pivot?->role;
    }

    protected function isWorkspaceAdminOrOwner(Workspace $workspace, ?User $user = null): bool
    {
        $role = $this->workspaceRoleFor($workspace, $user);

        return in_array($role, ['owner', 'admin'], true);
    }

    protected function assertCanAccessWorkspace(Workspace $workspace): void
    {
        if ($this->isSuperAdmin()) {
            return;
        }

        $user = Auth::user();

        if (! $user) {
            throw new AccessDeniedHttpException('You must be logged in to access this workspace.');
        }

        $isAcceptedMember = $workspace->members->contains(
            fn (User $member) => $member->id === $user->id
                && ($member->pivot->status ?? WorkspaceUser::STATUS_ACCEPTED) === WorkspaceUser::STATUS_ACCEPTED
        ) || $workspace->acceptedMembers()->where('users.id', $user->id)->exists();

        if (! $isAcceptedMember) {
            throw new NotFoundHttpException('Workspace not found.');
        }
    }

    protected function assertCanManageWorkspace(Workspace $workspace): void
    {
        if ($this->isSuperAdmin()) {
            return;
        }

        if (! $this->isWorkspaceAdminOrOwner($workspace)) {
            throw new AccessDeniedHttpException('Only workspace owners and admins can manage this workspace.');
        }
    }

    /**
     * Create / delete tasks — owners and admins only.
     * Members may still update and move tasks via assertCanAccessWorkspace.
     */
    protected function assertCanCreateOrDeleteTasks(Workspace $workspace): void
    {
        $this->assertCanManageWorkspace($workspace);
    }

    protected function assertIsWorkspaceOwner(Workspace $workspace): void
    {
        if ($this->isSuperAdmin()) {
            return;
        }

        $user = Auth::user();

        if (! $user || (int) $workspace->owner_id !== (int) $user->id) {
            throw new AccessDeniedHttpException('Only the workspace owner can perform this action.');
        }
    }

    protected function filterProjectsForCurrentUser(Workspace $workspace): Workspace
    {
        if ($this->isSuperAdmin() || $this->isWorkspaceAdminOrOwner($workspace)) {
            return $workspace;
        }

        $userId = (int) Auth::id();

        $workspace->setRelation(
            'projects',
            $workspace->projects
                ->filter(function ($project) use ($userId): bool {
                    return $project->projectMembers->contains(
                        fn ($member) => (int) $member->id === $userId
                    );
                })
                ->values()
        );

        return $workspace;
    }
}
