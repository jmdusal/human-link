<?php

declare(strict_types=1);

namespace App\Services\TaskComment;

use App\Contracts\TaskCommentServiceInterface;
use App\Models\Task;
use App\Models\TaskActivity;
use App\Models\TaskComment;
use App\Models\User;
use App\Notifications\TaskMentionNotification;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Notification;
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

        $comment->load('user');

        TaskActivity::create([
            'task_id' => $task->id,
            'user_id' => Auth::id(),
            'type' => 'comment',
            'old_value' => null,
            'new_value' => mb_substr($comment->content, 0, 255),
        ]);

        $this->notifyMentions($task, $comment, $data);

        return $comment;
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

    protected function notifyMentions(Task $task, TaskComment $comment, array $data): void
    {
        $mentionedIds = collect($data['mentioned_user_ids'] ?? [])
            ->map(fn ($id) => (int) $id)
            ->filter()
            ->unique()
            ->values();

        if ($mentionedIds->isEmpty()) {
            $mentionedIds = $this->resolveMentionedUserIds($task, $comment->content);
        }

        $mentionedIds = $mentionedIds
            ->reject(fn (int $id) => $id === (int) Auth::id())
            ->values();

        if ($mentionedIds->isEmpty()) {
            return;
        }

        $users = User::query()->whereIn('id', $mentionedIds)->get();

        if ($users->isEmpty()) {
            return;
        }

        Notification::send(
            $users,
            new TaskMentionNotification($task->loadMissing('project'), $comment, Auth::user())
        );

        TaskActivity::create([
            'task_id' => $task->id,
            'user_id' => Auth::id(),
            'type' => 'mention',
            'old_value' => null,
            'new_value' => $users->pluck('name')->implode(', '),
        ]);
    }

    protected function resolveMentionedUserIds(Task $task, string $content): \Illuminate\Support\Collection
    {
        preg_match_all('/@([^\s@]+(?:\s+[^\s@]+)*)/', $content, $matches);

        $names = collect($matches[1] ?? [])
            ->map(fn (string $name) => trim($name))
            ->filter()
            ->unique()
            ->values();

        if ($names->isEmpty()) {
            return collect();
        }

        $task->loadMissing(['project.projectMembers', 'project.workspace.members']);

        $candidates = collect($task->project?->projectMembers ?? [])
            ->concat($task->project?->workspace?->members ?? [])
            ->unique('id');

        return $candidates
            ->filter(function (User $user) use ($names) {
                return $names->contains(fn (string $name) => strcasecmp($user->name, $name) === 0
                    || str_starts_with(strtolower($user->name), strtolower($name)));
            })
            ->pluck('id')
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values();
    }

    protected function ensureOwnedByCurrentUser(TaskComment $comment): void
    {
        if ($comment->user_id !== Auth::id()) {
            throw new HttpException(403, 'Unauthorized');
        }
    }
}
