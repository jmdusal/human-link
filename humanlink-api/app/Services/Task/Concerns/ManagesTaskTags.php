<?php

declare(strict_types=1);

namespace App\Services\Task\Concerns;

use App\Models\Task;

trait ManagesTaskTags
{
    protected function syncTags(Task $task, array $tags, bool $withTimestamps = false): void
    {
        $tagsToSync = collect($tags)
            ->mapWithKeys(function (mixed $tag) use ($withTimestamps): array {
                $id = is_array($tag) ? $tag['id'] : $tag;
                $pivot = $withTimestamps
                    ? ['created_at' => now(), 'updated_at' => now()]
                    : [];

                return [$id => $pivot];
            })
            ->all();

        $task->tags()->sync($tagsToSync);
    }
}
