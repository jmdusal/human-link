<?php

declare(strict_types=1);

namespace App\Contracts;

use App\Models\Status;
use Illuminate\Database\Eloquent\Collection;

interface StatusServiceInterface
{
    public function listByWorkspace(?int $workspaceId): Collection;

    public function create(array $data): Status;

    public function update(Status $status, array $data): Status;

    public function reorder(array $ids): void;

    public function delete(Status $status): void;
}
