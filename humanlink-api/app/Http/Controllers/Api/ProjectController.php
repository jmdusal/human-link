<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Contracts\ProjectServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\Project\StoreProjectRequest;
use App\Http\Requests\Project\UpdateProjectRequest;
use App\Models\Project;
use App\Models\Workspace;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function __construct(
        private ProjectServiceInterface $projectService
    ) {}

    public function index(Request $request, Workspace $workspace): JsonResponse
    {
        return response()->json([
            'data' => $this->projectService->listByWorkspace($workspace, $request->boolean('include_archived')),
        ], 200);
    }

    public function store(StoreProjectRequest $request): JsonResponse
    {
        $project = $this->projectService->create($request->validated());

        return response()->json([
            'message' => 'Project created successfully.',
            'data' => $project,
        ], 201);
    }

    public function update(UpdateProjectRequest $request, Project $project): JsonResponse
    {
        $project = $this->projectService->update($project, $request->validated());

        return response()->json([
            'message' => 'Project updated successfully.',
            'data' => $project,
        ], 200);
    }

    public function archive(Project $project): JsonResponse
    {
        $project = $this->projectService->archive($project);

        return response()->json([
            'message' => 'Project archived successfully.',
            'data' => $project,
        ], 200);
    }

    public function restore(Project $project): JsonResponse
    {
        $project = $this->projectService->restore($project);

        return response()->json([
            'message' => 'Project restored successfully.',
            'data' => $project,
        ], 200);
    }

    public function destroy(Project $project): JsonResponse
    {
        $this->projectService->delete($project);

        return response()->json([
            'message' => 'Project deleted successfully.',
        ], 200);
    }
}
