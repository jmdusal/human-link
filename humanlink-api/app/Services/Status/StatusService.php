<?php

declare(strict_types=1);

namespace App\Services\Status;

use App\Contracts\StatusServiceInterface;
use App\Models\Status;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class StatusService implements StatusServiceInterface
{
    public function listByWorkspace(?int $workspaceId): Collection
    {
        return Status::query()
            ->where('workspace_id', $workspaceId)
            ->get();
    }

    public function create(array $data): Status
    {
        return DB::transaction(fn (): Status => Status::create($data));
    }

    public function update(Status $status, array $data): Status
    {
        return DB::transaction(function () use ($status, $data): Status {
            $status->update($data);

            return $status;
        });
    }

    public function reorder(array $ids): void
    {
        DB::transaction(function () use ($ids): void {
            foreach ($ids as $index => $id) {
                Status::query()->where('id', $id)->update(['position' => $index]);
            }
        });
    }

    public function delete(Status $status): void
    {
        $workspaceId = $status->workspace_id;
        $deletedPosition = $status->position;

        $status->delete();

        Status::query()
            ->where('workspace_id', $workspaceId)
            ->where('position', '>', $deletedPosition)
            ->decrement('position');
    }
}
