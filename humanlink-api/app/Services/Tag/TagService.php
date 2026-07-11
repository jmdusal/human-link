<?php

declare(strict_types=1);

namespace App\Services\Tag;

use App\Contracts\TagServiceInterface;
use App\Models\Tag;
use App\Models\Workspace;
use App\Services\Workspace\Concerns\ManagesWorkspaceAccess;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class TagService implements TagServiceInterface
{
    use ManagesWorkspaceAccess;

    public function listByWorkspace(?int $workspaceId): Collection
    {
        if (! $workspaceId) {
            throw new AccessDeniedHttpException('workspace_id is required.');
        }

        $workspace = Workspace::query()->with('members')->findOrFail($workspaceId);
        $this->assertCanAccessWorkspace($workspace);

        return Tag::query()
            ->where('workspace_id', $workspaceId)
            ->get();
    }

    public function create(array $data): Tag
    {
        $workspace = Workspace::query()->with('members')->findOrFail($data['workspace_id']);
        $this->assertCanManageWorkspace($workspace);

        return DB::transaction(fn (): Tag => Tag::create($data));
    }

    public function update(Tag $tag, array $data): Tag
    {
        $tag->loadMissing('workspace.members');
        $this->assertCanManageWorkspace($tag->workspace);

        return DB::transaction(function () use ($tag, $data): Tag {
            $tag->update($data);

            return $tag;
        });
    }

    public function delete(Tag $tag): void
    {
        $tag->loadMissing('workspace.members');
        $this->assertCanManageWorkspace($tag->workspace);

        $tag->delete();
    }
}
