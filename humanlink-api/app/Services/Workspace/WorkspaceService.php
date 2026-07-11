<?php

declare(strict_types=1);

namespace App\Services\Workspace;

use App\Contracts\WorkspaceServiceInterface;
use App\Models\TaskActivity;
use App\Models\TaskComment;
use App\Models\Workspace;
use App\Models\WorkspaceUser;
use App\Services\Workspace\Concerns\ManagesWorkspaceAccess;
use App\Services\Workspace\Concerns\ManagesWorkspaceMembers;
use App\Support\CompanyContext;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Collection as SupportCollection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class WorkspaceService implements WorkspaceServiceInterface
{
    use ManagesWorkspaceAccess;
    use ManagesWorkspaceMembers;

    public function __construct(
        private CompanyContext $companyContext
    ) {}

    public function list(bool $includeArchived = false): Collection
    {
        $query = Workspace::query()
            ->select(['id', 'company_id', 'name', 'slug', 'owner_id', 'archived_at', 'created_at', 'updated_at'])
            ->with([
                'owner',
                'members',
                'projects' => function ($query) use ($includeArchived): void {
                    $query->select(['id', 'workspace_id', 'name']);

                    if (! $includeArchived) {
                        $query->whereNull('archived_at');
                    }
                },
                'projects.projectMembers',
            ])
            ->withCount([
                'acceptedMembers as members_count',
                'projects as projects_count' => function ($query) use ($includeArchived): void {
                    if (! $includeArchived) {
                        $query->whereNull('archived_at');
                    }
                },
            ]);

        $this->companyContext->constrain($query);

        if (! $includeArchived) {
            $query->whereNull('archived_at');
        }

        if (! $this->isSuperAdmin()) {
            $query->whereHas(
                'members',
                fn ($q) => $q->where('users.id', Auth::id())
                    ->where('workspace_users.status', WorkspaceUser::STATUS_ACCEPTED)
            );
        }

        $workspaces = $query->latest()->get();

        foreach ($workspaces as $workspace) {
            $this->filterProjectsForCurrentUser($workspace);
            $workspace->setAttribute('projects_count', $workspace->projects->count());
        }

        return $workspaces;
    }

    public function findBySlug(string $slug): Workspace
    {
        $query = Workspace::query()
            ->with([
                'owner',
                'members',
                'tags',
                'statuses',
                'projects' => function ($query): void {
                    $query
                        ->select([
                            'id',
                            'workspace_id',
                            'name',
                            'description',
                            'status',
                            'start_date',
                            'end_date',
                            'archived_at',
                            'created_at',
                            'updated_at',
                        ])
                        ->whereNull('archived_at')
                        ->with('projectMembers');
                },
            ])
            ->where('slug', $slug)
            ->whereNull('archived_at');

        $this->companyContext->constrain($query);

        $workspace = $query->firstOrFail();

        $this->assertCanAccessWorkspace($workspace);

        return $this->filterProjectsForCurrentUser($workspace);
    }

    public function create(array $data): Workspace
    {
        return DB::transaction(function () use ($data): Workspace {
            $workspace = Workspace::create([
                ...$this->workspacePayload($data),
                'company_id' => $this->companyContext->requireId(),
                'slug' => Str::slug($data['name']),
                'owner_id' => Auth::id(),
            ]);

            $this->attachOwner($workspace);

            if (isset($data['members'])) {
                $this->syncMembersOnCreate($workspace, $data['members']);
            }

            return $workspace->load('statuses', 'tags', 'members', 'projects');
        });
    }

    public function update(Workspace $workspace, array $data): Workspace
    {
        $this->assertCanManageWorkspace($workspace);

        return DB::transaction(function () use ($workspace, $data): Workspace {
            $payload = $this->workspacePayload($data);

            if (isset($data['name'])) {
                $payload['slug'] = Str::slug($data['name']);
            }

            if (isset($data['members'])) {
                $this->syncMembersOnUpdate($workspace, $data['members']);
            }

            $workspace->update($payload);

            return $workspace->load(['statuses', 'tags', 'members', 'projects']);
        });
    }

    public function delete(Workspace $workspace): void
    {
        $this->assertIsWorkspaceOwner($workspace);

        $workspace->delete();
    }

    public function archive(Workspace $workspace): Workspace
    {
        $this->assertIsWorkspaceOwner($workspace);

        $workspace->update(['archived_at' => now()]);

        return $workspace->fresh(['members', 'statuses', 'tags', 'projects']);
    }

    public function restore(Workspace $workspace): Workspace
    {
        $this->assertIsWorkspaceOwner($workspace);

        $workspace->update(['archived_at' => null]);

        return $workspace->fresh(['members', 'statuses', 'tags', 'projects']);
    }

    public function activity(Workspace $workspace, int $limit = 20): SupportCollection
    {
        $workspace->loadMissing('members');
        $this->assertCanAccessWorkspace($workspace);

        $projectIds = $workspace->projects()->pluck('id');

        if ($projectIds->isEmpty()) {
            return collect();
        }

        $taskIds = DB::table('tasks')
            ->whereIn('project_id', $projectIds)
            ->whereNull('deleted_at')
            ->pluck('id');

        if ($taskIds->isEmpty()) {
            return collect();
        }

        $activities = TaskActivity::query()
            ->with(['user:id,name,email', 'task:id,title,project_id'])
            ->whereIn('task_id', $taskIds)
            ->latest()
            ->limit($limit)
            ->get()
            ->map(fn (TaskActivity $activity) => [
                'id' => 'activity-'.$activity->id,
                'type' => $activity->type,
                'user' => $activity->user,
                'task_id' => $activity->task_id,
                'task_title' => $activity->task?->title,
                'project_id' => $activity->task?->project_id,
                'description' => $this->formatActivityDescription($activity),
                'created_at' => $activity->created_at?->toIso8601String(),
                'time' => $activity->created_at?->diffForHumans(),
            ]);

        $comments = TaskComment::query()
            ->with(['user:id,name,email', 'task:id,title,project_id'])
            ->whereIn('task_id', $taskIds)
            ->latest()
            ->limit($limit)
            ->get()
            ->map(fn (TaskComment $comment) => [
                'id' => 'comment-'.$comment->id,
                'type' => 'comment',
                'user' => $comment->user,
                'task_id' => $comment->task_id,
                'task_title' => $comment->task?->title,
                'project_id' => $comment->task?->project_id,
                'description' => $this->formatCommentDescription($comment),
                'created_at' => $comment->created_at?->toIso8601String(),
                'time' => $comment->created_at?->diffForHumans(),
            ]);

        return $activities
            ->concat($comments)
            ->sortByDesc('created_at')
            ->values()
            ->take($limit);
    }

    protected function formatActivityDescription(TaskActivity $activity): string
    {
        $userName = $activity->user?->name ?? 'Someone';
        $taskTitle = $activity->task?->title ?? 'a task';

        return match ($activity->type) {
            'status_change' => "{$userName} moved \"{$taskTitle}\" from {$activity->old_value} to {$activity->new_value}",
            'priority_change' => "{$userName} changed priority on \"{$taskTitle}\" to {$activity->new_value}",
            'comment' => "{$userName} commented on \"{$taskTitle}\"",
            'mention' => "{$userName} mentioned someone on \"{$taskTitle}\"",
            default => "{$userName} updated \"{$taskTitle}\"",
        };
    }

    protected function formatCommentDescription(TaskComment $comment): string
    {
        $userName = $comment->user?->name ?? 'Someone';
        $taskTitle = $comment->task?->title ?? 'a task';
        $preview = Str::limit(trim(strip_tags($comment->content)), 80);

        return "{$userName} commented on \"{$taskTitle}\": {$preview}";
    }

    protected function workspacePayload(array $data): array
    {
        return array_intersect_key($data, array_flip([
            'name',
            'slug',
        ]));
    }
}
