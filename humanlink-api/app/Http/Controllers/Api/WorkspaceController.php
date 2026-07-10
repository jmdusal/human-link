<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Contracts\WorkspaceServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\Workspace\StoreWorkspaceRequest;
use App\Http\Requests\Workspace\UpdateWorkspaceRequest;
use App\Models\Workspace;
use Illuminate\Http\JsonResponse;

class WorkspaceController extends Controller
{
    public function __construct(
        private WorkspaceServiceInterface $workspaceService
    ) {}

    public function index(): JsonResponse
    {
        return response()->json([
            'data' => $this->workspaceService->list(),
        ], 200);
    }

    public function store(StoreWorkspaceRequest $request): JsonResponse
    {
        $workspace = $this->workspaceService->create($request->validated());

        return response()->json([
            'message' => 'Workspace created successfully.',
            'data' => $workspace,
        ], 201);
    }

    public function update(UpdateWorkspaceRequest $request, Workspace $workspace): JsonResponse
    {
        $workspace = $this->workspaceService->update($workspace, $request->validated());

        return response()->json([
            'message' => 'Workspace updated successfully.',
            'data' => $workspace,
        ], 200);
    }

    public function showBySlug(string $slug): JsonResponse
    {
        return response()->json([
            'data' => $this->workspaceService->findBySlug($slug),
        ], 200);
    }

    public function destroy(Workspace $workspace): JsonResponse
    {
        $this->workspaceService->delete($workspace);

        return response()->json([
            'message' => 'Workspace deleted successfully',
        ], 200);
    }

    public function acceptInvitation(string $token): JsonResponse
    {
        $workspace = $this->workspaceService->acceptInvitation($token);

        return response()->json([
            'message' => 'Invitation accepted. You are now a member of this workspace.',
            'data' => $workspace,
        ], 200);
    }
}
