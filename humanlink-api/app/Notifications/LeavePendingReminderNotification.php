<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\LeaveRequest;
use App\Models\User;
use App\Notifications\Concerns\HasCompanyContext;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class LeavePendingReminderNotification extends Notification implements ShouldBroadcastNow
{
    use HasCompanyContext;
    use Queueable;

    public function __construct(
        private LeaveRequest $leaveRequest
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
        $companyId = $this->leaveRequest->user?->company_id;

        if ($companyId !== null) {
            return (int) $companyId;
        }

        if ($notifiable instanceof User && $notifiable->company_id !== null) {
            return (int) $notifiable->company_id;
        }

        return null;
    }

    /**
     * @return array<string, mixed>
     */
    protected function payload(): array
    {
        $employee = $this->leaveRequest->user?->name ?? 'An employee';
        $start = $this->leaveRequest->start_date?->format('F j, Y') ?? '';
        $end = $this->leaveRequest->end_date?->format('F j, Y') ?? '';

        return [
            'title' => 'Pending leave reminder',
            'message' => "{$employee}'s leave request ({$start} – {$end}) is still pending approval.",
            'type' => 'leave_pending_reminder',
            'leave_request_id' => $this->leaveRequest->id,
            'time' => now()->diffForHumans(),
        ];
    }
}
