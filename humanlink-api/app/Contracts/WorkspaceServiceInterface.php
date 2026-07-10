<?php

declare(strict_types=1);

namespace App\Contracts;

use App\Models\Workspace;
use Illuminate\Database\Eloquent\Collection;

interface WorkspaceServiceInterface
{
    public function list(): Collection;

    public function findBySlug(string $slug): Workspace;

    public function create(array $data): Workspace;

    public function update(Workspace $workspace, array $data): Workspace;

    public function delete(Workspace $workspace): void;
}
