<?php

declare(strict_types=1);

namespace App\Services\Task;

use App\Contracts\TaskServiceInterface;
use App\Models\Task;
use App\Services\Task\Concerns\LogsTaskActivity;
use App\Services\Task\Concerns\ManagesTaskAssignees;
use App\Services\Task\Concerns\ManagesTaskTags;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class TaskService implements TaskServiceInterface
{
    use LogsTaskActivity;
    use ManagesTaskAssignees;
    use ManagesTaskTags;

    public function list(): Collection
    {
        return Task::query()
            ->with(['project:id,name', 'status', 'assignees:id,name,email', 'creator:id,name'])
            ->latest()
            ->get();
    }

    public function create(array $data): Task
    {
        return DB::transaction(function () use ($data): Task {
            $payload = $this->taskPayload($data);
            $payload['creator_id'] = Auth::id();
            $payload['due_date'] = $payload['due_date'] ?? now();

            $task = Task::create($payload);

            if (isset($data['assignees'])) {
                $this->syncAssignees($task, $data['assignees']);
            }

            $tagIds = $data['tag_ids'] ?? $data['tagIds'] ?? null;
            if ($tagIds !== null) {
                $this->syncTags($task, $tagIds);
            }

            return $task->load(['assignees', 'status', 'tags']);
        });
    }

    public function update(Task $task, array $data): Task
    {
        return DB::transaction(function () use ($task, $data): Task {
            $oldStatusId = $task->status_id;
            $oldPriority = $task->priority;
            $payload = $this->taskPayload($data);

            if (isset($payload['status_id']) && $payload['status_id'] != $oldStatusId) {
                $this->logStatusChange($task, $oldStatusId, $payload['status_id']);
            }

            if (isset($payload['priority']) && $oldPriority != $payload['priority']) {
                $this->logPriorityChange($task, $oldPriority, $payload['priority']);
            }

            $task->update($payload);

            if (array_key_exists('assignees', $data)) {
                $this->syncAssignees($task, $data['assignees'] ?? [], withTimestamps: true);
            }

            if (array_key_exists('tag_ids', $data) || array_key_exists('tagIds', $data)) {
                $this->syncTags($task, $data['tag_ids'] ?? $data['tagIds'] ?? [], withTimestamps: true);
            }

            return $task->fresh(['assignees', 'status', 'tags', 'activities.user']);
        });
    }

    public function updatePosition(Task $task, array $data): Task
    {
        return DB::transaction(function () use ($task, $data): Task {
            $oldStatusId = $task->status_id;
            $newStatusId = (int) $data['status_id'];

            if ($oldStatusId != $newStatusId) {
                $this->logPositionStatusChange($task, (int) $oldStatusId, $newStatusId);
            }

            $task->update($data);

            return $task->load(['assignees', 'status', 'activities.user']);
        });
    }

    public function delete(Task $task): void
    {
        $task->delete();
    }

    protected function taskPayload(array $data): array
    {
        return array_intersect_key($data, array_flip([
            'project_id',
            'status_id',
            'title',
            'description',
            'priority',
            'position',
            'due_date',
            'estimate_minutes',
            'parent_id',
        ]));
    }
}
