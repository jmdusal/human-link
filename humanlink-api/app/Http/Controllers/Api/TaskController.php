<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\TaskActivity;
use App\Http\Requests\Task\StoreTaskRequest;
use App\Http\Requests\Task\UpdateTaskPositionRequest;
use App\Http\Requests\Task\UpdateTaskRequest;
use App\Models\Status;
use App\Models\TaskStatus;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\JsonResponse;

class TaskController extends Controller
{
    public function index(): JsonResponse
    {
        $tasks = Task::with(['project:id,name', 'status', 'assignees:id,name,email', 'creator:id,name'])->latest()->get();

        return response()->json([
            'data' => $tasks
        ], 200);
    }

    public function store(StoreTaskRequest $request): JsonResponse
    {
        $task = DB::transaction(function () use ($request) {
            $data = $request->safe()->except(['assignees', 'tag_ids']);
            $data['creator_id'] = Auth::id();
            $data['due_date'] = now();

            $task = Task::create($data);

            if ($request->has('assignees')) {
                $assigneesToSync = collect($request->assignees)
                    ->mapWithKeys(function ($user) {
                        return [
                            $user['id'] => [
                                // 'created_at' => now(),
                                // 'updated_at' => now(),
                            ]
                        ];
                    })->toArray();

                $task->assignees()->sync($assigneesToSync);
            }

            if ($request->has('tag_ids')) {
                $tagsToSync = collect($request->tag_ids)
                    ->mapWithKeys(function ($tag) {
                        $id = is_array($tag) ? $tag['id'] : $tag;
                        return [$id => []];
                    })->toArray();

                $task->tags()->sync($tagsToSync);
            }

            return $task->load(['assignees', 'status', 'tags']);
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Task created successfully',
            'data' => $task
        ], 201);
    }

    public function update(UpdateTaskRequest $request, Task $task): JsonResponse
    {
        $task = DB::transaction(function () use ($request, $task) {
            $oldStatusId = $task->status_id;
            $oldPriority = $task->priority;

            $data = $request->safe()->except(['assignees', 'tag_ids']);

            if (isset($data['status_id']) && $data['status_id'] != $oldStatusId) {
                TaskActivity::create([
                    'task_id' => $task->id,
                    'user_id' => Auth::id(),
                    'type' => 'status_change',
                    'old_value' => $oldStatusId,
                    'new_value' => $data['status_id'],
                ]);
            }

            if (isset($data['priority']) && $oldPriority != $data['priority']) {
                TaskActivity::create([
                    'task_id' => $task->id,
                    'user_id' => Auth::id(),
                    'type' => 'priority_change',
                    'old_value' => $oldPriority,
                    'new_value' => $data['priority'],
                ]);
            }

            $task->update($data);

            if ($request->has('assignees')) {
                $assigneesToSync = collect($request->assignees)
                    ->mapWithKeys(function ($user) {
                        return [
                            $user['id'] => [
                                'created_at' => now(),
                                'updated_at' => now(),
                            ]
                        ];
                    })->toArray();

                $task->assignees()->sync($assigneesToSync);
            }

            if ($request->has('tag_ids')) {
                $tagsToSync = collect($request->tag_ids)
                    ->mapWithKeys(function ($tag) {
                        $id = is_array($tag) ? $tag['id'] : $tag;
                        return [$id => [
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]];
                    })->toArray();

                $task->tags()->sync($tagsToSync);
            }

            return $task->fresh(['assignees', 'status', 'tags', 'activities.user']);
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Task updated successfully',
            'data' => $task
        ], 200);
    }

    public function updatePosition(UpdateTaskPositionRequest $request, Task $task): JsonResponse
    {
        $task = DB::transaction(function () use ($request, $task) {
            $oldStatusId = $task->status_id;
            $newStatusId = $request->status_id;

            if ($oldStatusId != $newStatusId) {
                $oldStatus = Status::find($oldStatusId);
                $newStatus = Status::find($newStatusId);
                // $oldStatus = TaskStatus::find($oldStatusId);
                // $newStatus = TaskStatus::find($newStatusId);


                $task->activities()->create([
                    'user_id'   => Auth::id(),
                    'type'      => 'status_change',
                    'old_value' => $oldStatus->name ?? 'Unknown',
                    'new_value' => $newStatus->name ?? 'Unknown',
                ]);
            }

            $task->update($request->validated());

            return $task;
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Task position updated successfully',
            'data' => $task->load(['assignees', 'status', 'activities.user'])
            // 'data' => $task
        ], 200);
    }

    public function destroy(Task $task)
    {
        $task->delete();

        return response()->json([
            'message' => 'Task archived successfully'
        ]);
    }
}
