<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\User;
use App\Models\Workspace;
use App\Notifications\Concerns\HasCompanyContext;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class WorkspaceInvitationAcceptedNotification extends Notification implements ShouldBroadcastNow
{
    use HasCompanyContext;
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
        return new BroadcastMessage($this->withCompanyContext($this->payload(), $notifiable));
    }

    public function toArray(object $notifiable): array
    {
        return $this->withCompanyContext($this->payload(), $notifiable);
    }

    public function companyId(?object $notifiable = null): ?int
    {
        if ($this->workspace->company_id !== null) {
            return (int) $this->workspace->company_id;
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
