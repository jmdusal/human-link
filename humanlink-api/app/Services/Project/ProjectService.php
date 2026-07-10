<?php

declare(strict_types=1);

namespace App\Services\Project;

use App\Contracts\ProjectServiceInterface;
use App\Models\Project;
use App\Models\Workspace;
use App\Services\Project\Concerns\ManagesProjectMembers;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class ProjectService implements ProjectServiceInterface
{
    use ManagesProjectMembers;

    public function listByWorkspace(Workspace $workspace): Collection
    {
        return $workspace->projects()
            ->select(['id', 'name', 'description', 'status', 'start_date', 'end_date'])
            ->with('projectMembers')
            ->latest()
            ->get();
    }

    public function create(array $data): Project
    {
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
