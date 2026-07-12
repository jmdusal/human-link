<?php

declare(strict_types=1);

namespace App\Services\Task;

use App\Contracts\TaskServiceInterface;
use App\Models\Project;
use App\Models\Task;
use App\Models\Workspace;
use App\Models\WorkspaceMember;
use App\Services\Task\Concerns\LogsTaskActivity;
use App\Services\Task\Concerns\ManagesTaskAssignees;
use App\Services\Task\Concerns\ManagesTaskTags;
use App\Services\Workspace\Concerns\ManagesWorkspaceAccess;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class TaskService implements TaskServiceInterface
{
    use LogsTaskActivity;
    use ManagesTaskAssignees;
    use ManagesTaskTags;
    use ManagesWorkspaceAccess;

    public function list(): Collection
    {
        $query = Task::query()
            ->with(['project:id,name,workspace_id', 'status', 'assignees:id,name,email', 'creator:id,name'])
            ->latest();

        if (! $this->isSuperAdmin()) {
            $workspaceIds = $this->accessibleWorkspaceIds();

            $query->whereHas('project', fn ($q) => $q->whereIn('workspace_id', $workspaceIds));
        }

        return $query->get();
    }

    public function listByWorkspace(Workspace $workspace): Collection
    {
        $workspace->loadMissing('members');
        $this->assertCanAccessWorkspace($workspace);

        $projectQuery = $workspace->projects()->whereNull('archived_at');

        if (! $this->isSuperAdmin() && ! $this->isWorkspaceAdminOrOwner($workspace)) {
            $projectQuery->whereHas('projectMembers', fn ($q) => $q->where('users.id', Auth::id()));
        }

        $projectIds = $projectQuery->pluck('id');

        if ($projectIds->isEmpty()) {
            return new Collection;
        }

        return Task::query()
            ->whereIn('project_id', $projectIds)
            ->with([
                'assignees:id,name,email',
                'tags:id,name,color',
                'status:id,workspace_id,name,color_hex,position',
                'subtasks',
            ])
            ->orderBy('position')
            ->get();
    }

    public function create(array $data): Task
    {
        $project = Project::query()->with('workspace.members')->findOrFail($data['project_id']);
        $this->assertCanCreateOrDeleteTasks($project->workspace);

        return DB::transaction(function () use ($data): Task {
            $payload = $this->taskPayload($data);
            $payload['creator_id'] = Auth::id();

            $task = Task::create($payload);

            if (isset($data['assignees'])) {
                $this->syncAssignees($task, $data['assignees']);
            }

            $tagIds = $data['tag_ids'] ?? $data['tagIds'] ?? null;
            if ($tagIds !== null) {
                $this->syncTags($task, $tagIds);
            }

            return $task->load(['assignees', 'status', 'tags', 'project.workspace']);
        });
    }

    public function update(Task $task, array $data): Task
    {
        $this->assertCanAccessTaskWorkspace($task);

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

            return $task->fresh(['assignees', 'status', 'tags', 'activities.user', 'project.workspace']);
        });
    }

    public function updatePosition(Task $task, array $data): Task
    {
        $this->assertCanAccessTaskWorkspace($task);

        return DB::transaction(function () use ($task, $data): Task {
            $oldStatusId = $task->status_id;
            $newStatusId = (int) $data['status_id'];

            if ($oldStatusId != $newStatusId) {
                $this->logPositionStatusChange($task, (int) $oldStatusId, $newStatusId);
            }

            $task->update($data);

            return $task->load(['assignees', 'status', 'activities.user', 'project.workspace']);
        });
    }

    public function delete(Task $task): void
    {
        $task->loadMissing('project.workspace.members');
        $this->assertCanCreateOrDeleteTasks($task->project->workspace);

        $task->delete();
    }

    protected function assertCanAccessTaskWorkspace(Task $task): void
    {
        $task->loadMissing('project.workspace.members');
        $this->assertCanAccessWorkspace($task->project->workspace);
    }

    protected function accessibleWorkspaceIds(): array
    {
        return Workspace::query()
            ->whereHas('members', function ($query): void {
                $query->where('users.id', Auth::id())
                    ->where('workspace_members.status', WorkspaceMember::STATUS_ACCEPTED);
            })
            ->pluck('id')
            ->all();
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
