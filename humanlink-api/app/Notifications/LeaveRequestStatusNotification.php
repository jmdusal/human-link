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

class LeaveRequestStatusNotification extends Notification implements ShouldBroadcastNow
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
        return new BroadcastMessage($this->withCompanyContext([
            'id' => $this->id,
            'title' => $this->title(),
            'message' => $this->message(),
            'type' => 'leave_request_status',
            'status' => $this->leaveRequest->status,
            'leave_request_id' => $this->leaveRequest->id,
            'time' => now()->diffForHumans(),
        ], $notifiable));
    }

    public function toArray(object $notifiable): array
    {
        return $this->withCompanyContext([
            'title' => $this->title(),
            'message' => $this->message(),
            'type' => 'leave_request_status',
            'status' => $this->leaveRequest->status,
            'leave_request_id' => $this->leaveRequest->id,
            'time' => now()->diffForHumans(),
        ], $notifiable);
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

    protected function title(): string
    {
        return 'Leave request '.ucfirst($this->leaveRequest->status);
    }

    protected function message(): string
    {
        $start = $this->leaveRequest->start_date->format('F j, Y');
        $end = $this->leaveRequest->end_date->format('F j, Y');

        return "Your leave request from {$start} to {$end} was {$this->leaveRequest->status}.";
    }
}
