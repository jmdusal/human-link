<?php

declare(strict_types=1);

namespace App\Services\Task\Concerns;

use App\Models\Task;

trait ManagesTaskAssignees
{
    protected function syncAssignees(Task $task, array $assignees, bool $withTimestamps = false): void
    {
        $assigneesToSync = collect($assignees)
            ->mapWithKeys(function (array $user) use ($withTimestamps): array {
                $pivot = $withTimestamps
                    ? ['created_at' => now(), 'updated_at' => now()]
                    : [];

                return [$user['id'] => $pivot];
            })
            ->all();

        $task->assignees()->sync($assigneesToSync);
    }
}
