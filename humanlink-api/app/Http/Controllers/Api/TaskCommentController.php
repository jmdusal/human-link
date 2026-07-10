<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Contracts\TaskCommentServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\TaskComment\StoreTaskCommentRequest;
use App\Http\Requests\TaskComment\UpdateTaskCommentRequest;
use App\Models\Task;
use App\Models\TaskComment;
use Illuminate\Http\JsonResponse;

class TaskCommentController extends Controller
{
    public function __construct(
        private TaskCommentServiceInterface $taskCommentService
    ) {}

    public function index(): void
    {
        //
    }

    public function store(StoreTaskCommentRequest $request, Task $task): TaskComment
    {
        return $this->taskCommentService->create($task, $request->validated());
    }

    public function update(UpdateTaskCommentRequest $request, TaskComment $comment): JsonResponse
    {
        $comment = $this->taskCommentService->update($comment, $request->validated());

        return response()->json($comment);
    }

    public function destroy(TaskComment $comment): JsonResponse
    {
        $this->taskCommentService->delete($comment);

        return response()->json(['message' => 'Comment deleted']);
    }
}
