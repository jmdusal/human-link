<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Contracts\AttendanceServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\Attendance\EndAttendanceRequest;
use App\Http\Requests\Attendance\StartAttendanceRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function __construct(
        private AttendanceServiceInterface $attendanceService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $result = $this->attendanceService->list(
            $request->query('start'),
            $request->query('end'),
        );

        return response()->json($result);
    }

    public function status(): JsonResponse
    {
        return response()->json([
            'data' => $this->attendanceService->status(),
        ]);
    }

    public function start(StartAttendanceRequest $request): JsonResponse
    {
        return response()->json([
            'message' => 'Timer started.',
            'data' => $this->attendanceService->start($request->validated()),
        ]);
    }

    public function pause(): JsonResponse
    {
        return response()->json([
            'message' => 'Timer paused.',
            'data' => $this->attendanceService->pause(),
        ]);
    }

    public function resume(): JsonResponse
    {
        return response()->json([
            'message' => 'Timer resumed.',
            'data' => $this->attendanceService->resume(),
        ]);
    }

    public function end(EndAttendanceRequest $request): JsonResponse
    {
        return response()->json([
            'message' => 'Attendance stopped for today.',
            'data' => $this->attendanceService->end($request->validated()),
        ]);
    }

    public function continueAttendance(): JsonResponse
    {
        return response()->json([
            'message' => 'Attendance continued for today.',
            'data' => $this->attendanceService->continueAttendance(),
        ]);
    }
}
