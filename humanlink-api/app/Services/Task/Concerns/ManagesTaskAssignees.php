<?php

declare(strict_types=1);

namespace App\Services\Task\Concerns;

use App\Models\Task;
use App\Models\User;
use App\Notifications\TaskAssignedNotification;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Notification;

trait ManagesTaskAssignees
{
    protected function syncAssignees(Task $task, array $assignees, bool $withTimestamps = false): void
    {
        $previousIds = $task->assignees()->pluck('users.id')->map(fn ($id) => (int) $id)->all();

        $assigneesToSync = collect($assignees)
            ->mapWithKeys(function (array $user) use ($withTimestamps): array {
                $pivot = $withTimestamps
                    ? ['created_at' => now(), 'updated_at' => now()]
                    : [];

                return [$user['id'] => $pivot];
            })
            ->all();

        $task->assignees()->sync($assigneesToSync);

        $newIds = array_values(array_diff(array_map('intval', array_keys($assigneesToSync)), $previousIds));
        $actorId = (int) Auth::id();
        $notifyIds = array_values(array_filter($newIds, fn (int $id) => $id !== $actorId));

        if ($notifyIds === []) {
            return;
        }

        $task->loadMissing('project.workspace');

        $recipients = User::query()->whereIn('id', $notifyIds)->get();
        Notification::send($recipients, new TaskAssignedNotification($task, Auth::user()));
    }
}
