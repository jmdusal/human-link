<?php

declare(strict_types=1);

namespace App\Contracts;

use App\Models\User;
use App\Models\Workspace;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Collection as SupportCollection;

interface WorkspaceServiceInterface
{
    public function list(bool $includeArchived = false): Collection;

    public function findBySlug(string $slug): Workspace;

    public function create(array $data): Workspace;

    public function update(Workspace $workspace, array $data): Workspace;

    public function delete(Workspace $workspace): void;

    public function archive(Workspace $workspace): Workspace;

    public function restore(Workspace $workspace): Workspace;

    public function activity(Workspace $workspace, int $limit = 20): SupportCollection;

    public function acceptInvitation(string $token): Workspace;

    public function declineInvitation(string $token): void;

    public function resendInvitation(Workspace $workspace, User $user): Workspace;

    public function cancelInvitation(Workspace $workspace, User $user): Workspace;

    public function leave(Workspace $workspace): void;

    public function inviteMember(Workspace $workspace, int $userId, string $role = 'member'): Workspace;

    public function removeMember(Workspace $workspace, User $user): Workspace;

    public function changeMemberRole(Workspace $workspace, User $user, string $role): Workspace;

    public function transferOwnership(Workspace $workspace, User $newOwner): Workspace;
}
