<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Contracts\DashboardServiceInterface;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function __construct(
        private DashboardServiceInterface $dashboardService
    ) {}

    public function summary(): JsonResponse
    {
        return response()->json([
            'data' => $this->dashboardService->summary(),
        ]);
    }
}
