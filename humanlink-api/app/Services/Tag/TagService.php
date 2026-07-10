<?php

declare(strict_types=1);

namespace App\Services\Tag;

use App\Contracts\TagServiceInterface;
use App\Models\Tag;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class TagService implements TagServiceInterface
{
    public function listByWorkspace(?int $workspaceId): Collection
    {
        return Tag::query()
            ->where('workspace_id', $workspaceId)
            ->get();
    }

    public function create(array $data): Tag
    {
        return DB::transaction(fn (): Tag => Tag::create($data));
    }

    public function update(Tag $tag, array $data): Tag
    {
        return DB::transaction(function () use ($tag, $data): Tag {
            $tag->update($data);

            return $tag;
        });
    }

    public function delete(Tag $tag): void
    {
        $tag->delete();
    }
}
