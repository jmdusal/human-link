<?php

declare(strict_types=1);

namespace App\Services\Workspace;

use App\Contracts\WorkspaceServiceInterface;
use App\Models\Workspace;
use App\Services\Workspace\Concerns\CreatesDefaultWorkspaceSetup;
use App\Services\Workspace\Concerns\ManagesWorkspaceAccess;
use App\Services\Workspace\Concerns\ManagesWorkspaceMembers;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class WorkspaceService implements WorkspaceServiceInterface
{
    use CreatesDefaultWorkspaceSetup;
    use ManagesWorkspaceAccess;
    use ManagesWorkspaceMembers;

    public function list(): Collection
    {
        $query = Workspace::query()
            ->with([
                'owner',
                'members',
                'tags',
                'statuses',
                'projects.projectMembers',
                'projects.tasks.assignees',
                'projects.tasks.tags:id,name,color',
                'projects.tasks.comments' => function ($query): void {
                    $query->whereNull('parent_id')->with('user', 'replies.user')->latest();
                },
            ]);

        if (! $this->isSuperAdmin()) {
            $query->whereHas('members', fn ($q) => $q->where('users.id', Auth::id()));
        }

        return $query->latest()->get();
    }

    public function findBySlug(string $slug): Workspace
    {
        $workspace = Workspace::query()
            ->with([
                'owner',
                'members',
                'tags',
                'statuses',
                'projects.projectMembers',
                'projects.tasks' => function ($query): void {
                    $query->with(['assignees', 'tags:id,name,color', 'subtasks']);
                },
                'projects.tasks.comments' => function ($query): void {
                    $query->whereNull('parent_id')->with('user', 'replies.user')->latest();
                },
            ])
            ->where('slug', $slug)
            ->firstOrFail();

        $this->assertCanAccessWorkspace($workspace);

        return $this->filterProjectsForCurrentUser($workspace);
    }

    public function create(array $data): Workspace
    {
        return DB::transaction(function () use ($data): Workspace {
            $workspace = Workspace::create([
                ...$this->workspacePayload($data),
                'slug' => Str::slug($data['name']),
                'owner_id' => Auth::id(),
            ]);

            $this->attachOwner($workspace);

            if (isset($data['members'])) {
                $this->syncMembersOnCreate($workspace, $data['members']);
            }

            $this->createDefaultStatuses($workspace);
            $this->createDefaultTags($workspace);

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
        $this->assertCanManageWorkspace($workspace);

        $workspace->delete();
    }

    protected function workspacePayload(array $data): array
    {
        return array_intersect_key($data, array_flip([
            'name',
            'slug',
            'owner_id',
        ]));
    }
}
