<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\TaskComment\StoreTaskCommentRequest;
use App\Http\Requests\TaskComment\UpdateTaskCommentRequest;
use App\Models\Task;
use App\Models\TaskComment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TaskCommentController extends Controller
{
    public function index()
    {
        //
    }

    public function store(StoreTaskCommentRequest $request, Task $task)
    {
        $comment = $task->comments()->create([
            'user_id'   => Auth::id(),
            'content'   => $request->content,
            'parent_id' => $request->parent_id,
        ]);

        return $comment->load('user');

        // return response()->json([
        //     'message'   => 'Comment deleted',
        //     'data'      => $comment->load('user')
        // ]);
    }

    public function update(UpdateTaskCommentRequest $request, TaskComment $comment)
    {
        if ($comment->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $comment->update($request->validated());

        return response()->json($comment->load('user'));
    }

    public function destroy(TaskComment $comment): JsonResponse
    {
        if ($comment->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $comment->delete();
        return response()->json(['message' => 'Comment deleted']);
    }
}
