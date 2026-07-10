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

    public function listByWorkspace(Workspace $workspace): Collection;

    public function listByProject(Project $project): Collection;
}
