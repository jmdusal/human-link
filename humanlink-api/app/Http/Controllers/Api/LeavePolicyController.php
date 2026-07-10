<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Contracts\LeavePolicyServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\LeavePolicy\StoreLeavePolicyRequest;
use App\Http\Requests\LeavePolicy\UpdateLeavePolicyRequest;
use App\Models\LeavePolicy;
use Illuminate\Http\JsonResponse;

class LeavePolicyController extends Controller
{
    public function __construct(
        private LeavePolicyServiceInterface $leavePolicyService
    ) {}

    public function index(): JsonResponse
    {
        return response()->json([
            'data' => $this->leavePolicyService->list(),
        ], 200);
    }

    public function store(StoreLeavePolicyRequest $request): JsonResponse
    {
        $leavePolicy = $this->leavePolicyService->create($request->validated());

        return response()->json([
            'message' => 'Leave policy created successfully.',
            'data' => $leavePolicy,
        ], 201);
    }

    public function update(UpdateLeavePolicyRequest $request, LeavePolicy $leavePolicy): JsonResponse
    {
        $leavePolicy = $this->leavePolicyService->update($leavePolicy, $request->validated());

        return response()->json([
            'message' => 'Leave policy updated successfully.',
            'data' => $leavePolicy,
        ], 200);
    }

    public function destroy(LeavePolicy $leavePolicy): JsonResponse
    {
        $this->leavePolicyService->delete($leavePolicy);

        return response()->json([
            'message' => 'Leave Policy deleted successfully',
        ], 200);
    }
}
