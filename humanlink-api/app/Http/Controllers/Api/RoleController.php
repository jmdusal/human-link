<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Role\StoreRoleRequest;
use App\Http\Requests\Role\UpdateRoleRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Role;
use Illuminate\Support\Facades\DB;

class RoleController extends Controller
{

    public function index(): JsonResponse
    {
        $roles = Role::with('permissions')->latest()->get();

        return response()->json([
            'data' => $roles
        ], 200);
    }

    public function store(StoreRoleRequest $request): JsonResponse
    {
        $role = DB::transaction(function () use ($request) {
            $data = array_merge($request->validated(), ['guard_name' => 'web']);
            $role = Role::create($data);

            if ($request->has('permissions')) {
                $role->syncPermissions($request->input('permissions'));
            }

            return $role;
        });

        return response()->json([
            'message' => 'Role created successfully.',
            'data' => $role->load('permissions')
        ], 201);
    }

    public function update(UpdateRoleRequest $request, Role $role): JsonResponse
    {
        $role = DB::transaction(function () use ($request, $role) {
            $role->update($request->validated());

            if ($request->has('permissions')) {
                $role->syncPermissions($request->input('permissions'));
            }

            return $role;
        });

        return response()->json([
            'message' => 'Role updated successfully.',
            'data' => $role->load('permissions')
        ], 200);
    }

    public function destroy(Role $role): JsonResponse
    {
        $role->delete();

        return response()->json([
            'message' => 'Role deleted successfully'
        ], 200);
    }
}
