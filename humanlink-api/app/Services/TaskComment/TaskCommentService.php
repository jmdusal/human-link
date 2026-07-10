<?php

declare(strict_types=1);

namespace App\Services\TaskComment;

use App\Contracts\TaskCommentServiceInterface;
use App\Models\Task;
use App\Models\TaskComment;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpKernel\Exception\HttpException;

class TaskCommentService implements TaskCommentServiceInterface
{
    public function create(Task $task, array $data): TaskComment
    {
        $comment = $task->comments()->create([
            'user_id' => Auth::id(),
            'content' => $data['content'],
            'parent_id' => $data['parent_id'] ?? null,
        ]);

        return $comment->load('user');
    }

    public function update(TaskComment $comment, array $data): TaskComment
    {
        $this->ensureOwnedByCurrentUser($comment);

        $comment->update($data);

        return $comment->load('user');
    }

    public function delete(TaskComment $comment): void
    {
        $this->ensureOwnedByCurrentUser($comment);

        $comment->delete();
    }

    protected function ensureOwnedByCurrentUser(TaskComment $comment): void
    {
        if ($comment->user_id !== Auth::id()) {
            throw new HttpException(403, 'Unauthorized');
        }
    }
}
