<?php

declare(strict_types=1);

namespace App\Contracts;

use App\Models\Project;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Database\Eloquent\Collection;

interface UserServiceInterface
{
    public function list(): Collection;

    public function create(array $data): User;

    public function update(User $user, array $data): User;

    public function delete(User $user): void;

    public function resendInvite(User $user): User;

    public function forcePasswordReset(User $user): User;

    public function deactivate(User $user): User;

    public function activate(User $user): User;

    public function listByWorkspace(Workspace $workspace): Collection;

    public function listByProject(Project $project): Collection;

    public function listManagers(): Collection;
}
