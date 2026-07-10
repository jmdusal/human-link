<?php

declare(strict_types=1);

namespace App\Services\Task\Concerns;

use App\Models\Status;
use App\Models\Task;
use App\Models\TaskActivity;
use Illuminate\Support\Facades\Auth;

trait LogsTaskActivity
{
    protected function logStatusChange(Task $task, mixed $oldValue, mixed $newValue): void
    {
        TaskActivity::create([
            'task_id' => $task->id,
            'user_id' => Auth::id(),
            'type' => 'status_change',
            'old_value' => $oldValue,
            'new_value' => $newValue,
        ]);
    }

    protected function logPriorityChange(Task $task, mixed $oldValue, mixed $newValue): void
    {
        TaskActivity::create([
            'task_id' => $task->id,
            'user_id' => Auth::id(),
            'type' => 'priority_change',
            'old_value' => $oldValue,
            'new_value' => $newValue,
        ]);
    }

    protected function logPositionStatusChange(Task $task, int $oldStatusId, int $newStatusId): void
    {
        $oldStatus = Status::find($oldStatusId);
        $newStatus = Status::find($newStatusId);

        $task->activities()->create([
            'user_id' => Auth::id(),
            'type' => 'status_change',
            'old_value' => $oldStatus->name ?? 'Unknown',
            'new_value' => $newStatus->name ?? 'Unknown',
        ]);
    }
}
