<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Contracts\RoleServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\Role\StoreRoleRequest;
use App\Http\Requests\Role\UpdateRoleRequest;
use App\Models\Role;
use Illuminate\Http\JsonResponse;

class RoleController extends Controller
{
    public function __construct(
        private RoleServiceInterface $roleService
    ) {}

    public function index(): JsonResponse
    {
        return response()->json([
            'data' => $this->roleService->list(),
        ], 200);
    }

    public function store(StoreRoleRequest $request): JsonResponse
    {
        $role = $this->roleService->create($request->validated());

        return response()->json([
            'message' => 'Role created successfully.',
            'data' => $role,
        ], 201);
    }

    public function update(UpdateRoleRequest $request, Role $role): JsonResponse
    {
        $role = $this->roleService->update($role, $request->validated());

        return response()->json([
            'message' => 'Role updated successfully.',
            'data' => $role,
        ], 200);
    }

    public function destroy(Role $role): JsonResponse
    {
        $this->roleService->delete($role);

        return response()->json([
            'message' => 'Role deleted successfully',
        ], 200);
    }
}
