<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Contracts\DepartmentServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\Department\StoreDepartmentRequest;
use App\Http\Requests\Department\UpdateDepartmentRequest;
use App\Models\Department;
use Illuminate\Http\JsonResponse;

class DepartmentController extends Controller
{
    public function __construct(
        private DepartmentServiceInterface $departmentService
    ) {}

    public function index(): JsonResponse
    {
        return response()->json([
            'data' => $this->departmentService->list(),
        ], 200);
    }

    public function store(StoreDepartmentRequest $request): JsonResponse
    {
        $department = $this->departmentService->create($request->validated());

        return response()->json([
            'message' => 'Department created successfully.',
            'data' => $department->loadCount('positions'),
        ], 201);
    }

    public function update(UpdateDepartmentRequest $request, Department $department): JsonResponse
    {
        $department = $this->departmentService->update($department, $request->validated());

        return response()->json([
            'message' => 'Department updated successfully.',
            'data' => $department,
        ], 200);
    }

    public function destroy(Department $department): JsonResponse
    {
        $this->departmentService->delete($department);

        return response()->json([
            'message' => 'Department deleted successfully.',
        ], 200);
    }
}
