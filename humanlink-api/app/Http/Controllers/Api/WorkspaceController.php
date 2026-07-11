<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Contracts\WorkspaceServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\Workspace\InviteWorkspaceMemberRequest;
use App\Http\Requests\Workspace\StoreWorkspaceRequest;
use App\Http\Requests\Workspace\TransferWorkspaceOwnershipRequest;
use App\Http\Requests\Workspace\UpdateWorkspaceMemberRoleRequest;
use App\Http\Requests\Workspace\UpdateWorkspaceRequest;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WorkspaceController extends Controller
{
    public function __construct(
        private WorkspaceServiceInterface $workspaceService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $includeArchived = $request->boolean('include_archived');

        return response()->json([
            'data' => $this->workspaceService->list($includeArchived),
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

    public function archive(Workspace $workspace): JsonResponse
    {
        $workspace = $this->workspaceService->archive($workspace);

        return response()->json([
            'message' => 'Workspace archived successfully.',
            'data' => $workspace,
        ], 200);
    }

    public function restore(Workspace $workspace): JsonResponse
    {
        $workspace = $this->workspaceService->restore($workspace);

        return response()->json([
            'message' => 'Workspace restored successfully.',
            'data' => $workspace,
        ], 200);
    }

    public function activity(Workspace $workspace): JsonResponse
    {
        return response()->json([
            'data' => $this->workspaceService->activity($workspace),
        ], 200);
    }

    public function inviteMember(InviteWorkspaceMemberRequest $request, Workspace $workspace): JsonResponse
    {
        $data = $request->validated();
        $workspace = $this->workspaceService->inviteMember(
            $workspace,
            (int) $data['user_id'],
            $data['role'] ?? 'member',
        );

        return response()->json([
            'message' => 'Invitation sent.',
            'data' => $workspace,
        ], 201);
    }

    public function removeMember(Workspace $workspace, User $user): JsonResponse
    {
        $workspace = $this->workspaceService->removeMember($workspace, $user);

        return response()->json([
            'message' => 'Member removed.',
            'data' => $workspace,
        ], 200);
    }

    public function changeMemberRole(UpdateWorkspaceMemberRoleRequest $request, Workspace $workspace, User $user): JsonResponse
    {
        $workspace = $this->workspaceService->changeMemberRole(
            $workspace,
            $user,
            $request->validated()['role'],
        );

        return response()->json([
            'message' => 'Member role updated.',
            'data' => $workspace,
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

    public function declineInvitation(string $token): JsonResponse
    {
        $this->workspaceService->declineInvitation($token);

        return response()->json([
            'message' => 'Invitation declined.',
        ], 200);
    }

    public function resendInvitation(Workspace $workspace, User $user): JsonResponse
    {
        $workspace = $this->workspaceService->resendInvitation($workspace, $user);

        return response()->json([
            'message' => 'Invitation resent.',
            'data' => $workspace,
        ], 200);
    }

    public function cancelInvitation(Workspace $workspace, User $user): JsonResponse
    {
        $workspace = $this->workspaceService->cancelInvitation($workspace, $user);

        return response()->json([
            'message' => 'Invitation cancelled.',
            'data' => $workspace,
        ], 200);
    }

    public function leave(Workspace $workspace): JsonResponse
    {
        $this->workspaceService->leave($workspace);

        return response()->json([
            'message' => 'You left the workspace.',
        ], 200);
    }

    public function transferOwnership(TransferWorkspaceOwnershipRequest $request, Workspace $workspace): JsonResponse
    {
        $newOwner = User::query()->findOrFail((int) $request->validated()['user_id']);
        $workspace = $this->workspaceService->transferOwnership($workspace, $newOwner);

        return response()->json([
            'message' => 'Ownership transferred.',
            'data' => $workspace,
        ], 200);
    }
}
