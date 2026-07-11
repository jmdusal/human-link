<?php

declare(strict_types=1);

namespace App\Contracts;

use App\Models\Project;
use App\Models\Workspace;
use Illuminate\Database\Eloquent\Collection;

interface ProjectServiceInterface
{
    public function listByWorkspace(Workspace $workspace, bool $includeArchived = false): Collection;

    public function create(array $data): Project;

    public function update(Project $project, array $data): Project;

    public function delete(Project $project): void;

    public function archive(Project $project): Project;

    public function restore(Project $project): Project;
}
