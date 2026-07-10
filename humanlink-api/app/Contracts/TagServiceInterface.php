<?php

declare(strict_types=1);

namespace App\Contracts;

use App\Models\Tag;
use Illuminate\Database\Eloquent\Collection;

interface TagServiceInterface
{
    public function listByWorkspace(?int $workspaceId): Collection;

    public function create(array $data): Tag;

    public function update(Tag $tag, array $data): Tag;

    public function delete(Tag $tag): void;
}
