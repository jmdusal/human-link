<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\LeaveRequest;
use App\Models\User;
use App\Notifications\LeavePendingReminderNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Notification;

class NotifyPendingLeaveRemindersCommand extends Command
{
    protected $signature = 'leave:notify-pending-reminders';

    protected $description = 'Remind managers about leave requests still pending after one day';

    public function handle(): int
    {
        $cutoff = now()->subDay();
        $reminded = 0;

        $pending = LeaveRequest::query()
            ->with('user:id,name,email')
            ->where('status', 'pending')
            ->where('created_at', '<=', $cutoff)
            ->get();

        $recipients = User::query()
            ->where('status', 'active')
            ->where(function ($query): void {
                $query->where('user_type', 'manager')
                    ->orWhereHas('roles', function ($roles): void {
                        $roles->whereIn('name', ['super-admin', 'hr-manager']);
                    });
            })
            ->get();

        foreach ($pending as $leaveRequest) {
            $targets = $recipients->where('id', '!=', $leaveRequest->user_id)->values();

            if ($targets->isEmpty()) {
                continue;
            }

            $alreadyReminded = false;
            foreach ($targets as $target) {
                $exists = $target->notifications()
                    ->where('type', LeavePendingReminderNotification::class)
                    ->where('created_at', '>=', now()->subDay())
                    ->where('data->leave_request_id', $leaveRequest->id)
                    ->exists();

                if ($exists) {
                    $alreadyReminded = true;
                    break;
                }
            }

            if ($alreadyReminded) {
                continue;
            }

            Notification::send($targets, new LeavePendingReminderNotification($leaveRequest));
            $reminded++;
        }

        $this->info("Sent pending leave reminders for {$reminded} request(s).");

        return self::SUCCESS;
    }
}
