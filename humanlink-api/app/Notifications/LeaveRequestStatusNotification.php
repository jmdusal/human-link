<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\LeaveRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class LeaveRequestStatusNotification extends Notification implements ShouldBroadcastNow
{
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
        return new BroadcastMessage([
            'id' => $this->id,
            'title' => $this->title(),
            'message' => $this->message(),
            'type' => 'leave_request_status',
            'status' => $this->leaveRequest->status,
            'leave_request_id' => $this->leaveRequest->id,
            'time' => now()->diffForHumans(),
        ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => $this->title(),
            'message' => $this->message(),
            'type' => 'leave_request_status',
            'status' => $this->leaveRequest->status,
            'leave_request_id' => $this->leaveRequest->id,
            'time' => now()->diffForHumans(),
        ];
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
