<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Contracts\TaskAttachmentServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\TaskAttachment\StoreTaskAttachmentRequest;
use App\Models\Task;
use App\Models\TaskAttachment;
use Illuminate\Http\JsonResponse;

class TaskAttachmentController extends Controller
{
    public function __construct(
        private TaskAttachmentServiceInterface $taskAttachmentService
    ) {}

    public function store(StoreTaskAttachmentRequest $request, Task $task): JsonResponse
    {
        $attachment = $this->taskAttachmentService->create(
            $task,
            $request->file('image')
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Attachment uploaded successfully',
            'data' => $attachment,
        ], 201);
    }

    public function index(Task $task): JsonResponse
    {
        return response()->json([
            'data' => $this->taskAttachmentService->list($task),
        ]);
    }

    public function destroy(TaskAttachment $attachment): JsonResponse
    {
        $this->taskAttachmentService->delete($attachment);

        return response()->json([
            'message' => 'Attachment deleted successfully',
        ]);
    }
}
