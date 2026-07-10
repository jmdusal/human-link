<?php

declare(strict_types=1);

namespace App\Services\Workspace;

use App\Contracts\WorkspaceServiceInterface;
use App\Models\Workspace;
use App\Services\Workspace\Concerns\CreatesDefaultWorkspaceSetup;
use App\Services\Workspace\Concerns\ManagesWorkspaceMembers;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class WorkspaceService implements WorkspaceServiceInterface
{
    use CreatesDefaultWorkspaceSetup;
    use ManagesWorkspaceMembers;

    public function list(): Collection
    {
        return Workspace::query()
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
            ])
            ->latest()
            ->get();
    }

    public function findBySlug(string $slug): Workspace
    {
        return Workspace::query()
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
