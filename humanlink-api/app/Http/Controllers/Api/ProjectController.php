<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
// use App\Http\Requests\Project\StoreProjectRequest;
use App\Http\Requests\Project\StoreProjectRequest;
use App\Http\Requests\Project\UpdateProjectRequest;
use App\Models\Project;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\JsonResponse;

class ProjectController extends Controller
{
    public function index(Workspace $workspace)
    {
        $projects = $workspace->projects()
            ->select(['id', 'name', 'description', 'status', 'start_date', 'end_date'])
            ->with('projectMembers')
            ->latest()
            ->get();

        return response()->json($projects);
    }

    public function store(StoreProjectRequest $request): JsonResponse
    {
        $project = DB::transaction(function () use ($request) {
            $project = Project::create($request->validated());

            if ($request->has('project_members')) {
                $membersWithRoles = collect($request->project_members)
                    ->mapWithKeys(function ($member) {
                        return [
                            $member['id'] => [
                                'role' => $member['pivot']['role'] ?? 'member'
                            ]
                        ];
                    })->toArray();

                // $membersWithRoles = collect($request->project_members)->mapWithKeys(fn($m) => [
                //     $m['id'] => ['role' => $m['pivot']['role'] ?? 'member']
                // ]);

                $project->projectMembers()->sync($membersWithRoles);
            }

            return $project;
        });

        return response()->json([
            'message' => 'Project created successfully.',
            'data' => $project->load('projectMembers', 'workspace')
        ], 201);
    }

    public function update(UpdateProjectRequest $request, Project $project): JsonResponse
    {
        $project = DB::transaction(function () use ($request, $project) {
            $project->update($request->validated());

            if ($request->has('project_members')) {
                $membersWithRoles = collect($request->project_members)
                    ->mapWithKeys(function ($member) {
                        return [
                            $member['id'] => [
                                'role' => $member['pivot']['role'] ?? 'member'
                            ]
                        ];
                    })->toArray();

                $project->projectMembers()->sync($membersWithRoles);
            }

            return $project;
        });

        return response()->json([
            'message' => 'Project updated successfully.',
            'data' => $project->load('projectMembers', 'workspace')
        ], 200);
    }

    public function destroy(Project $project)
    {
        $project->delete();

        return response()->json([
            'message' => 'Project deleted successfully.'
        ], 200);
    }
}
