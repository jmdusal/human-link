<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LeaveBalance;
use App\Http\Requests\LeaveBalance\StoreLeaveBalanceRequest;
use App\Http\Requests\LeaveBalance\UpdateLeaveBalanceRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LeaveBalanceController extends Controller
{
   public function index(): JsonResponse
    {
        $leaveBalances = LeaveBalance::with(['user', 'leavePolicy'])->latest()->get();

        return response()->json([
            'data' => $leaveBalances
        ], 200);
    }

    public function store(StoreLeaveBalanceRequest $request)
    {
        $leaveBalance = DB::transaction(fn () => LeaveBalance::create($request->validated()));

        return response()->json([
            'message' => 'User leave balance created successfully.',
            'data' => $leaveBalance->load(['user', 'leavePolicy'])
        ], 201);
    }

    public function update(UpdateLeaveBalanceRequest $request, LeaveBalance $leaveBalance): JsonResponse
    {
        $leaveBalance = DB::transaction(function () use ($request, $leaveBalance) {
            $leaveBalance->update($request->validated());

            return $leaveBalance->load(['user', 'leavePolicy']);
        });

        return response()->json([
            'message' => 'User leave balance updated successfully.',
            'data' => $leaveBalance
        ], 200);
    }

    public function destroy(LeaveBalance $leaveBalance): JsonResponse
    {
        DB::transaction(fn () => $leaveBalance->delete());

        return response()->json([
            'message' => 'Leave balance deleted successfully'
        ], 200);
    }
}
