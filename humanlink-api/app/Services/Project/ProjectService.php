<?php

declare(strict_types=1);

namespace App\Services\Project;

use App\Contracts\ProjectServiceInterface;
use App\Models\Project;
use App\Models\Workspace;
use App\Services\Project\Concerns\ManagesProjectMembers;
use App\Services\Workspace\Concerns\ManagesWorkspaceAccess;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ProjectService implements ProjectServiceInterface
{
    use ManagesProjectMembers;
    use ManagesWorkspaceAccess;

    public function listByWorkspace(Workspace $workspace): Collection
    {
        $workspace->loadMissing('members');
        $this->assertCanAccessWorkspace($workspace);

        $query = $workspace->projects()
            ->select(['id', 'workspace_id', 'name', 'description', 'status', 'start_date', 'end_date', 'created_at'])
            ->with('projectMembers');

        if (! $this->isSuperAdmin() && ! $this->isWorkspaceAdminOrOwner($workspace)) {
            $query->whereHas('projectMembers', fn ($q) => $q->where('users.id', Auth::id()));
        }

        return $query->latest()->get();
    }

    public function create(array $data): Project
    {
        $workspace = Workspace::query()->with('members')->findOrFail($data['workspace_id']);
        $this->assertCanManageWorkspace($workspace);

        return DB::transaction(function () use ($data): Project {
            $project = Project::create($this->projectPayload($data));

            if (isset($data['project_members'])) {
                $this->syncProjectMembers($project, $data['project_members']);
            }

            return $project->load('projectMembers', 'workspace');
        });
    }

    public function update(Project $project, array $data): Project
    {
        $project->loadMissing('workspace.members');
        $this->assertCanManageWorkspace($project->workspace);

        return DB::transaction(function () use ($project, $data): Project {
            $project->update($this->projectPayload($data));

            if (isset($data['project_members'])) {
                $this->syncProjectMembers($project, $data['project_members']);
            }

            return $project->load('projectMembers', 'workspace');
        });
    }

    public function delete(Project $project): void
    {
        $project->loadMissing('workspace.members');
        $this->assertCanManageWorkspace($project->workspace);

        $project->delete();
    }

    protected function projectPayload(array $data): array
    {
        return array_intersect_key($data, array_flip([
            'workspace_id',
            'name',
            'description',
            'status',
            'start_date',
            'end_date',
        ]));
    }
}
