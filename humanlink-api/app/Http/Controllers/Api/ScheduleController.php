<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Contracts\ScheduleServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\Schedule\StoreScheduleRequest;
use App\Http\Requests\Schedule\UpdateScheduleRequest;
use App\Models\Schedule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ScheduleController extends Controller
{
    public function __construct(
        private ScheduleServiceInterface $scheduleService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $result = $this->scheduleService->list(
            $request->query('start'),
            $request->query('end'),
        );

        return response()->json($result);
    }

    public function show(Schedule $schedule): JsonResponse
    {
        return response()->json([
            'data' => $this->scheduleService->show($schedule),
        ]);
    }

    public function store(StoreScheduleRequest $request): JsonResponse
    {
        $schedule = $this->scheduleService->create($request->validated());

        return response()->json([
            'message' => 'Schedule created successfully.',
            'data' => $schedule,
        ], 201);
    }

    public function update(UpdateScheduleRequest $request, Schedule $schedule): JsonResponse
    {
        $schedule = $this->scheduleService->update($schedule, $request->validated());

        return response()->json([
            'message' => 'Schedule updated successfully.',
            'data' => $schedule,
        ]);
    }

    public function destroy(Schedule $schedule): JsonResponse
    {
        $this->scheduleService->delete($schedule);

        return response()->json([
            'message' => 'Schedule deleted successfully.',
        ]);
    }
}
