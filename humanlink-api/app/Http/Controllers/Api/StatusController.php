<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Status\ReorderStatusRequest;
use App\Http\Requests\Status\StoreStatusRequest;
use App\Http\Requests\Status\UpdateStatusRequest;
use App\Models\Status;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\JsonResponse;

class StatusController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $status = Status::where('workspace_id', $request->workspace_id)->get();

        return response()->json([
            'data' => $status
        ], 200);
    }

    public function store(StoreStatusRequest $request): JsonResponse
    {
        $status = DB::transaction(function () use ($request) {
            return Status::create($request->validated());
        });

        return response()->json([
            'message' => 'Status created successfully.',
            'data' => $status
        ], 201);
    }

    public function reorder(ReorderStatusRequest $request): JsonResponse
    {
        DB::transaction(function () use ($request) {
            foreach ($request->validated()['ids'] as $index => $id) {
                Status::where('id', $id)->update(['position' => $index]);
            }
        });

        return response()->json([
            'message' => 'Statuses reordered successfully.'
        ]);
    }

    public function update(UpdateStatusRequest $request, Status $status): JsonResponse
    {
        $status = DB::transaction(function () use ($request, $status) {
            $status->update($request->validated());
            return $status;
        });

        return response()->json([
            'message' => 'Status updated successfully.',
            'data' => $status
        ], 200);
    }

    public function destroy(Status $status): JsonResponse
    {
        $workspaceId = $status->workspace_id;
        $deletedPosition = $status->position;

        $status->delete();

        Status::where('workspace_id', $workspaceId)
            ->where('position', '>', $deletedPosition)
            ->decrement('position');

        return response()->json([
            'status' => 'success',
            'message' => 'Status deleted successfully'
        ], 200);
    }
}
