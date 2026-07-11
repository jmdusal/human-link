<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Contracts\LeaveRequestServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\LeaveRequest\ApproveLeaveRequestRequest;
use App\Http\Requests\LeaveRequest\RejectLeaveRequestRequest;
use App\Http\Requests\LeaveRequest\StoreLeaveRequestRequest;
use App\Http\Requests\LeaveRequest\UpdateLeaveRequestRequest;
use App\Models\LeaveRequest;
use Illuminate\Http\JsonResponse;

class LeaveRequestController extends Controller
{
    public function __construct(
        private LeaveRequestServiceInterface $leaveRequestService
    ) {}

    public function index(): JsonResponse
    {
        return response()->json([
            'data' => $this->leaveRequestService->list(),
        ], 200);
    }

    public function policyOptions(): JsonResponse
    {
        return response()->json([
            'data' => $this->leaveRequestService->listPolicyOptions(),
        ], 200);
    }

    public function calendar(\Illuminate\Http\Request $request): JsonResponse
    {
        $result = $this->leaveRequestService->calendar(
            $request->query('start'),
            $request->query('end'),
            $request->query('status'),
        );

        return response()->json($result, 200);
    }

    public function conflicts(LeaveRequest $leaveRequest): JsonResponse
    {
        return response()->json([
            'data' => $this->leaveRequestService->conflicts($leaveRequest),
        ], 200);
    }

    public function store(StoreLeaveRequestRequest $request): JsonResponse
    {
        $leaveRequest = $this->leaveRequestService->create($request->validated());

        return response()->json([
            'message' => 'Leave request submitted successfully.',
            'data' => $leaveRequest,
        ], 201);
    }

    public function show(LeaveRequest $leaveRequest): JsonResponse
    {
        return response()->json([
            'data' => $this->leaveRequestService->show($leaveRequest),
        ], 200);
    }

    public function update(UpdateLeaveRequestRequest $request, LeaveRequest $leaveRequest): JsonResponse
    {
        $leaveRequest = $this->leaveRequestService->update($leaveRequest, $request->validated());

        return response()->json([
            'message' => 'Leave request updated successfully.',
            'data' => $leaveRequest,
        ], 200);
    }

    public function approve(ApproveLeaveRequestRequest $request, LeaveRequest $leaveRequest): JsonResponse
    {
        $leaveRequest = $this->leaveRequestService->approve(
            $leaveRequest,
            $request->validated('comment')
        );

        return response()->json([
            'message' => 'Leave request approved successfully.',
            'data' => $leaveRequest,
        ], 200);
    }

    public function reject(RejectLeaveRequestRequest $request, LeaveRequest $leaveRequest): JsonResponse
    {
        $leaveRequest = $this->leaveRequestService->reject(
            $leaveRequest,
            $request->validated('comment')
        );

        return response()->json([
            'message' => 'Leave request rejected successfully.',
            'data' => $leaveRequest,
        ], 200);
    }

    public function cancel(LeaveRequest $leaveRequest): JsonResponse
    {
        $leaveRequest = $this->leaveRequestService->cancel($leaveRequest);

        return response()->json([
            'message' => 'Leave request cancelled successfully.',
            'data' => $leaveRequest,
        ], 200);
    }

    public function destroy(LeaveRequest $leaveRequest): JsonResponse
    {
        $this->leaveRequestService->delete($leaveRequest);

        return response()->json([
            'message' => 'Leave request deleted successfully.',
        ], 200);
    }
}
