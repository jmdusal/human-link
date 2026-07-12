<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Contracts\PositionServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\Position\StorePositionRequest;
use App\Http\Requests\Position\UpdatePositionRequest;
use App\Models\Position;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PositionController extends Controller
{
    public function __construct(
        private PositionServiceInterface $positionService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $departmentId = $request->filled('department_id')
            ? $request->integer('department_id')
            : null;

        return response()->json([
            'data' => $this->positionService->list($departmentId),
        ], 200);
    }

    public function store(StorePositionRequest $request): JsonResponse
    {
        $position = $this->positionService->create($request->validated());

        return response()->json([
            'message' => 'Job created successfully.',
            'data' => $position,
        ], 201);
    }

    public function update(UpdatePositionRequest $request, Position $position): JsonResponse
    {
        $position = $this->positionService->update($position, $request->validated());

        return response()->json([
            'message' => 'Job updated successfully.',
            'data' => $position,
        ], 200);
    }

    public function destroy(Position $position): JsonResponse
    {
        $this->positionService->delete($position);

        return response()->json([
            'message' => 'Job deleted successfully.',
        ], 200);
    }
}
