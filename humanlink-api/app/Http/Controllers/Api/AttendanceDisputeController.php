<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Contracts\AttendanceDisputeServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\AttendanceDispute\ResolveAttendanceDisputeRequest;
use App\Http\Requests\AttendanceDispute\StoreAttendanceDisputeRequest;
use App\Models\AttendanceDispute;
use Illuminate\Http\JsonResponse;

class AttendanceDisputeController extends Controller
{
    public function __construct(
        private AttendanceDisputeServiceInterface $attendanceDisputeService
    ) {}

    public function index(): JsonResponse
    {
        return response()->json([
            'data' => $this->attendanceDisputeService->list(),
        ]);
    }

    public function store(StoreAttendanceDisputeRequest $request): JsonResponse
    {
        $dispute = $this->attendanceDisputeService->create($request->validated());

        return response()->json([
            'message' => 'Attendance dispute submitted.',
            'data' => $dispute,
        ], 201);
    }

    public function approve(ResolveAttendanceDisputeRequest $request, AttendanceDispute $attendanceDispute): JsonResponse
    {
        $dispute = $this->attendanceDisputeService->approve(
            $attendanceDispute,
            $request->validated()
        );

        return response()->json([
            'message' => 'Dispute approved.',
            'data' => $dispute,
        ]);
    }

    public function reject(ResolveAttendanceDisputeRequest $request, AttendanceDispute $attendanceDispute): JsonResponse
    {
        $dispute = $this->attendanceDisputeService->reject(
            $attendanceDispute,
            $request->validated()
        );

        return response()->json([
            'message' => 'Dispute rejected.',
            'data' => $dispute,
        ]);
    }
}
