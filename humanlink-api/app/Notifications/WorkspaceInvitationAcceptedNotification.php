<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\User;
use App\Models\Workspace;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class WorkspaceInvitationAcceptedNotification extends Notification implements ShouldBroadcastNow
{
    use Queueable;

    public function __construct(
        private Workspace $workspace,
        private User $member,
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
            'type' => 'workspace_invitation_accepted',
            'workspace_id' => $this->workspace->id,
            'workspace_slug' => $this->workspace->slug,
            'time' => now()->diffForHumans(),
        ];
    }

    protected function title(): string
    {
        return "{$this->member->name} joined {$this->workspace->name}";
    }

    protected function message(): string
    {
        return "{$this->member->name} accepted the invitation to {$this->workspace->name}.";
    }
}
