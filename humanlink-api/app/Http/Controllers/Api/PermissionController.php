<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Permission\StorePermissionRequest;
use App\Http\Requests\Permission\UpdatePermissionRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
// use Spatie\Permission\Models\Permission;
use App\Models\Permission;
use Illuminate\Support\Facades\DB;

class PermissionController extends Controller
{
    public function index(): JsonResponse
    {
        $permissions = Permission::latest()->get();

        return response()->json([
            'data' => $permissions
        ], 200);
    }

    public function store(StorePermissionRequest $request): JsonResponse
    {
        $permission = DB::transaction(function () use ($request) {
            $data = array_merge($request->validated(), ['guard_name' => 'web']);
            return Permission::create($data);
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Permission created successfully',
            'data' => $permission
        ], 201);
    }

    public function update(UpdatePermissionRequest $request, Permission $permission): JsonResponse
    {
        $permission = DB::transaction(function () use ($request, $permission) {
            $permission->update($request->validated());
            return $permission;
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Permission updated successfully',
            'data' => $permission
        ], 200);
    }

    public function destroy(Permission $permission): JsonResponse
    {
        DB::transaction(fn () => $permission->delete());

        return response()->json([
            'message' => 'Permission deleted successfully'
        ], 200);
    }
}
