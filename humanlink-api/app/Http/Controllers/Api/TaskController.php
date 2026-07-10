<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Contracts\TaskServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\Task\StoreTaskRequest;
use App\Http\Requests\Task\UpdateTaskPositionRequest;
use App\Http\Requests\Task\UpdateTaskRequest;
use App\Models\Task;
use Illuminate\Http\JsonResponse;

class TaskController extends Controller
{
    public function __construct(
        private TaskServiceInterface $taskService
    ) {}

    public function index(): JsonResponse
    {
        return response()->json([
            'data' => $this->taskService->list(),
        ], 200);
    }

    public function store(StoreTaskRequest $request): JsonResponse
    {
        $task = $this->taskService->create($request->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'Task created successfully',
            'data' => $task,
        ], 201);
    }

    public function update(UpdateTaskRequest $request, Task $task): JsonResponse
    {
        $task = $this->taskService->update($task, $request->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'Task updated successfully',
            'data' => $task,
        ], 200);
    }

    public function updatePosition(UpdateTaskPositionRequest $request, Task $task): JsonResponse
    {
        $task = $this->taskService->updatePosition($task, $request->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'Task position updated successfully',
            'data' => $task,
        ], 200);
    }

    public function destroy(Task $task): JsonResponse
    {
        $this->taskService->delete($task);

        return response()->json([
            'message' => 'Task archived successfully',
        ]);
    }
}
