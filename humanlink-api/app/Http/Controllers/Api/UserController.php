<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Contracts\UserServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Models\Project;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    public function __construct(
        private UserServiceInterface $userService
    ) {}

    public function index(): JsonResponse
    {
        return response()->json([
            'data' => $this->userService->list(),
        ], 200);
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $user = $this->userService->create($request->validated());

        return response()->json([
            'data' => $user,
        ], 201);
    }

    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $user = $this->userService->update($user, $request->validated());

        return response()->json([
            'message' => 'User updated successfully',
            'data' => $user,
        ], 200);
    }

    public function destroy(User $user): JsonResponse
    {
        $this->userService->delete($user);

        return response()->json([
            'status' => 'success',
            'message' => 'User deleted successfully',
        ], 200);
    }

    public function getWorkspaceUsers(Workspace $workspace): JsonResponse
    {
        return response()->json([
            'data' => $this->userService->listByWorkspace($workspace),
        ], 200);
    }

    public function getProjectUsers(Project $project): JsonResponse
    {
        return response()->json([
            'data' => $this->userService->listByProject($project),
        ], 200);
    }
}
