<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Contracts\LeaveBalanceServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\LeaveBalance\StoreLeaveBalanceRequest;
use App\Http\Requests\LeaveBalance\UpdateLeaveBalanceRequest;
use App\Models\LeaveBalance;
use Illuminate\Http\JsonResponse;

class LeaveBalanceController extends Controller
{
    public function __construct(
        private LeaveBalanceServiceInterface $leaveBalanceService
    ) {}

    public function index(): JsonResponse
    {
        return response()->json([
            'data' => $this->leaveBalanceService->list(),
        ], 200);
    }

    public function store(StoreLeaveBalanceRequest $request): JsonResponse
    {
        $leaveBalance = $this->leaveBalanceService->create($request->validated());

        return response()->json([
            'message' => 'User leave balance created successfully.',
            'data' => $leaveBalance,
        ], 201);
    }

    public function update(UpdateLeaveBalanceRequest $request, LeaveBalance $leaveBalance): JsonResponse
    {
        $leaveBalance = $this->leaveBalanceService->update($leaveBalance, $request->validated());

        return response()->json([
            'message' => 'User leave balance updated successfully.',
            'data' => $leaveBalance,
        ], 200);
    }

    public function destroy(LeaveBalance $leaveBalance): JsonResponse
    {
        $this->leaveBalanceService->delete($leaveBalance);

        return response()->json([
            'message' => 'Leave balance deleted successfully',
        ], 200);
    }
}
