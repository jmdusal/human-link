<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Contracts\LeaveServiceInterface;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class LeaveController extends Controller
{
    public function __construct(
        private LeaveServiceInterface $leaveService
    ) {}

    public function index(): JsonResponse
    {
        return response()->json([
            'data' => $this->leaveService->dashboard(),
        ]);
    }
}
