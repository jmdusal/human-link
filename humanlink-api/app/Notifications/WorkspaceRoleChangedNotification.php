<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\User;
use App\Models\Workspace;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class WorkspaceRoleChangedNotification extends Notification implements ShouldBroadcastNow
{
    use Queueable;

    public function __construct(
        private Workspace $workspace,
        private string $role,
        private ?User $changedBy = null,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->payload());
    }

    public function toArray(object $notifiable): array
    {
        return $this->payload();
    }

    protected function payload(): array
    {
        return [
            'title' => $this->title(),
            'message' => $this->message(),
            'type' => 'workspace_role_changed',
            'workspace_id' => $this->workspace->id,
            'workspace_slug' => $this->workspace->slug,
            'role' => $this->role,
            'time' => now()->diffForHumans(),
        ];
    }

    protected function title(): string
    {
        return "Role updated in {$this->workspace->name}";
    }

    protected function message(): string
    {
        $by = $this->changedBy?->name;

        return $by
            ? "{$by} changed your role to {$this->role} in {$this->workspace->name}."
            : "Your role was changed to {$this->role} in {$this->workspace->name}.";
    }
}
