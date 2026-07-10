<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Contracts\PermissionServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\Permission\StorePermissionRequest;
use App\Http\Requests\Permission\UpdatePermissionRequest;
use App\Models\Permission;
use Illuminate\Http\JsonResponse;

class PermissionController extends Controller
{
    public function __construct(
        private PermissionServiceInterface $permissionService
    ) {}

    public function index(): JsonResponse
    {
        return response()->json([
            'data' => $this->permissionService->list(),
        ], 200);
    }

    public function store(StorePermissionRequest $request): JsonResponse
    {
        $permission = $this->permissionService->create($request->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'Permission created successfully',
            'data' => $permission,
        ], 201);
    }

    public function update(UpdatePermissionRequest $request, Permission $permission): JsonResponse
    {
        $permission = $this->permissionService->update($permission, $request->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'Permission updated successfully',
            'data' => $permission,
        ], 200);
    }

    public function destroy(Permission $permission): JsonResponse
    {
        $this->permissionService->delete($permission);

        return response()->json([
            'message' => 'Permission deleted successfully',
        ], 200);
    }
}
