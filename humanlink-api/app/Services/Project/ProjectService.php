<?php

declare(strict_types=1);

namespace App\Services\Project;

use App\Contracts\ProjectServiceInterface;
use App\Models\Project;
use App\Models\Workspace;
use App\Services\Project\Concerns\AppliesProjectTemplate;
use App\Services\Project\Concerns\ManagesProjectMembers;
use App\Services\Workspace\Concerns\ManagesWorkspaceAccess;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ProjectService implements ProjectServiceInterface
{
    use AppliesProjectTemplate;
    use ManagesProjectMembers;
    use ManagesWorkspaceAccess;

    public function listByWorkspace(Workspace $workspace, bool $includeArchived = false): Collection
    {
        $workspace->loadMissing('members');
        $this->assertCanAccessWorkspace($workspace);

        $query = $workspace->projects()
            ->select(['id', 'workspace_id', 'name', 'description', 'status', 'start_date', 'end_date', 'archived_at', 'created_at'])
            ->with('projectMembers');

        if (! $includeArchived) {
            $query->whereNull('archived_at');
        }

        if (! $this->isSuperAdmin() && ! $this->isWorkspaceAdminOrOwner($workspace)) {
            $query->whereHas('projectMembers', fn ($q) => $q->where('users.id', Auth::id()));
        }

        return $query->latest()->get();
    }

    public function create(array $data): Project
    {
        $workspace = Workspace::query()->with(['members', 'statuses', 'tags'])->findOrFail($data['workspace_id']);
        $this->assertCanManageWorkspace($workspace);

        return DB::transaction(function () use ($data, $workspace): Project {
            if (! empty($data['template'])) {
                $this->applyProjectTemplate($workspace, $data['template']);
            }

            $project = Project::create($this->projectPayload($data));

            if (isset($data['project_members'])) {
                $this->syncProjectMembers($project, $data['project_members']);
            }

            return $project->load('projectMembers', 'workspace.statuses', 'workspace.tags');
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

    public function archive(Project $project): Project
    {
        $project->loadMissing('workspace.members');
        $this->assertCanManageWorkspace($project->workspace);

        $project->update(['archived_at' => now()]);

        return $project->fresh(['projectMembers', 'workspace']);
    }

    public function restore(Project $project): Project
    {
        $project->loadMissing('workspace.members');
        $this->assertCanManageWorkspace($project->workspace);

        $project->update(['archived_at' => null]);

        return $project->fresh(['projectMembers', 'workspace']);
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
