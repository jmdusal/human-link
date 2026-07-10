<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Contracts\ScheduleServiceInterface;
use App\Http\Controllers\Controller;
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
}
