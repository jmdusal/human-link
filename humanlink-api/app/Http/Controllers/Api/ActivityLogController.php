<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Contracts\ActivityLogServiceInterface;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class ActivityLogController extends Controller
{
    public function __construct(
        private ActivityLogServiceInterface $activityLogService
    ) {}

    public function index(): JsonResponse
    {
        return response()->json([
            'data' => $this->activityLogService->list(),
        ], 200);
    }
}
