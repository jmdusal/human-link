<?php

declare(strict_types=1);

namespace App\Services\Status;

use App\Contracts\StatusServiceInterface;
use App\Models\Status;
use App\Models\Workspace;
use App\Services\Workspace\Concerns\ManagesWorkspaceAccess;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class StatusService implements StatusServiceInterface
{
    use ManagesWorkspaceAccess;

    public function listByWorkspace(?int $workspaceId): Collection
    {
        if (! $workspaceId) {
            throw new AccessDeniedHttpException('workspace_id is required.');
        }

        $workspace = Workspace::query()->with('members')->findOrFail($workspaceId);
        $this->assertCanAccessWorkspace($workspace);

        return Status::query()
            ->where('workspace_id', $workspaceId)
            ->orderBy('position')
            ->get();
    }

    public function create(array $data): Status
    {
        $workspace = Workspace::query()->with('members')->findOrFail($data['workspace_id']);
        $this->assertCanManageWorkspace($workspace);

        return DB::transaction(fn (): Status => Status::create($data));
    }

    public function update(Status $status, array $data): Status
    {
        $status->loadMissing('workspace.members');
        $this->assertCanManageWorkspace($status->workspace);

        return DB::transaction(function () use ($status, $data): Status {
            $status->update($data);

            return $status;
        });
    }

    public function reorder(array $ids): void
    {
        $first = Status::query()->with('workspace.members')->find($ids[0] ?? null);

        if (! $first) {
            return;
        }

        $this->assertCanManageWorkspace($first->workspace);

        DB::transaction(function () use ($ids): void {
            foreach ($ids as $index => $id) {
                Status::query()->where('id', $id)->update(['position' => $index]);
            }
        });
    }

    public function delete(Status $status): void
    {
        $status->loadMissing('workspace.members');
        $this->assertCanManageWorkspace($status->workspace);

        $workspaceId = $status->workspace_id;
        $deletedPosition = $status->position;

        $status->delete();

        Status::query()
            ->where('workspace_id', $workspaceId)
            ->where('position', '>', $deletedPosition)
            ->decrement('position');
    }
}
