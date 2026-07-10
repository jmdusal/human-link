<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Contracts\StatusServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\Status\ReorderStatusRequest;
use App\Http\Requests\Status\StoreStatusRequest;
use App\Http\Requests\Status\UpdateStatusRequest;
use App\Models\Status;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StatusController extends Controller
{
    public function __construct(
        private StatusServiceInterface $statusService
    ) {}

    public function index(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $this->statusService->listByWorkspace(
                $request->integer('workspace_id') ?: null
            ),
        ], 200);
    }

    public function store(StoreStatusRequest $request): JsonResponse
    {
        $status = $this->statusService->create($request->validated());

        return response()->json([
            'message' => 'Status created successfully.',
            'data' => $status,
        ], 201);
    }

    public function reorder(ReorderStatusRequest $request): JsonResponse
    {
        $this->statusService->reorder($request->validated()['ids']);

        return response()->json([
            'message' => 'Statuses reordered successfully.',
        ]);
    }

    public function update(UpdateStatusRequest $request, Status $status): JsonResponse
    {
        $status = $this->statusService->update($status, $request->validated());

        return response()->json([
            'message' => 'Status updated successfully.',
            'data' => $status,
        ], 200);
    }

    public function destroy(Status $status): JsonResponse
    {
        $this->statusService->delete($status);

        return response()->json([
            'status' => 'success',
            'message' => 'Status deleted successfully',
        ], 200);
    }
}
