<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\LeaveRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class LeaveRequestSubmittedNotification extends Notification implements ShouldBroadcastNow
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
            'type' => 'leave_request_submitted',
            'leave_request_id' => $this->leaveRequest->id,
            'time' => now()->diffForHumans(),
        ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => $this->title(),
            'message' => $this->message(),
            'type' => 'leave_request_submitted',
            'leave_request_id' => $this->leaveRequest->id,
            'time' => now()->diffForHumans(),
        ];
    }

    protected function title(): string
    {
        $employeeName = $this->leaveRequest->user?->name ?? 'An employee';

        return "{$employeeName} requested leave";
    }

    protected function message(): string
    {
        $employeeName = $this->leaveRequest->user?->name ?? 'An employee';
        $start = $this->leaveRequest->start_date->format('F j, Y');
        $end = $this->leaveRequest->end_date->format('F j, Y');

        return "{$employeeName} submitted a leave request from {$start} to {$end}.";
    }
}
