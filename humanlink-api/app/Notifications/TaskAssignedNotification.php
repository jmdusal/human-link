<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\Task;
use App\Models\User;
use App\Notifications\Concerns\HasCompanyContext;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class TaskAssignedNotification extends Notification implements ShouldBroadcastNow
{
    use HasCompanyContext;
    use Queueable;

    public function __construct(
        private Task $task,
        private ?User $assignedBy = null,
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
        $workspace = $this->task->project?->workspace;

        return [
            'title' => $this->title(),
            'message' => $this->message(),
            'type' => 'task_assigned',
            'task_id' => $this->task->id,
            'project_id' => $this->task->project_id,
            'workspace_id' => $workspace?->id,
            'workspace_slug' => $workspace?->slug,
            'time' => now()->diffForHumans(),
        ];
    }

    protected function title(): string
    {
        return 'Task assigned to you';
    }

    protected function message(): string
    {
        $by = $this->assignedBy?->name;

        return $by
            ? "{$by} assigned you to \"{$this->task->title}\"."
            : "You were assigned to \"{$this->task->title}\".";
    }
}
