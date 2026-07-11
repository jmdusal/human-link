<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\Task;
use App\Models\TaskComment;
use App\Models\User;
use App\Notifications\Concerns\HasCompanyContext;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class TaskMentionNotification extends Notification implements ShouldBroadcastNow
{
    use HasCompanyContext;
    use Queueable;

    public function __construct(
        private Task $task,
        private TaskComment $comment,
        private User $mentionedBy
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->withCompanyContext($this->payload(), $notifiable));
    }

    public function toArray(object $notifiable): array
    {
        return $this->withCompanyContext($this->payload(), $notifiable);
    }

    public function companyId(?object $notifiable = null): ?int
    {
        $companyId = $this->task->project?->workspace?->company_id;

        if ($companyId !== null) {
            return (int) $companyId;
        }

        if ($notifiable instanceof User && $notifiable->company_id !== null) {
            return (int) $notifiable->company_id;
        }

        return null;
    }

    protected function payload(): array
    {
        return [
            'title' => $this->title(),
            'message' => $this->message(),
            'type' => 'task_mention',
            'task_id' => $this->task->id,
            'comment_id' => $this->comment->id,
            'project_id' => $this->task->project_id,
            'time' => now()->diffForHumans(),
        ];
    }

    protected function title(): string
    {
        return "{$this->mentionedBy->name} mentioned you";
    }

    protected function message(): string
    {
        return "{$this->mentionedBy->name} mentioned you on \"{$this->task->title}\".";
    }
}
