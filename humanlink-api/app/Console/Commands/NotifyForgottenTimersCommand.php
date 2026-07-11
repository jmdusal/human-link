<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\User;
use App\Notifications\TimerForgottenNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class NotifyForgottenTimersCommand extends Command
{
    protected $signature = 'attendance:notify-forgotten-timers';

    protected $description = 'Notify employees whose attendance timer is still running past schedule end or evening cutoff';

    public function handle(): int
    {
        $now = now();
        $notified = 0;

        $users = User::query()
            ->where('status', 'active')
            ->whereIn('timer_status', ['working', 'paused'])
            ->with(['schedule'])
            ->get();

        foreach ($users as $user) {
            if (! $this->shouldNotify($user, $now)) {
                continue;
            }

            $alreadyNotified = $user->notifications()
                ->where('type', TimerForgottenNotification::class)
                ->where('created_at', '>=', $now->copy()->startOfDay())
                ->exists();

            if ($alreadyNotified) {
                continue;
            }

            $user->notify(new TimerForgottenNotification);
            $notified++;
        }

        $this->info("Notified {$notified} user(s) about forgotten timers.");

        return self::SUCCESS;
    }

    protected function shouldNotify(User $user, Carbon $now): bool
    {
        if ($now->hour >= 19) {
            return true;
        }

        $schedule = $user->schedule;
        if (! $schedule) {
            return false;
        }

        $scheduledEnd = $this->resolveScheduledEnd($schedule, $now);

        if (! $scheduledEnd) {
            return false;
        }

        return $now->greaterThan($scheduledEnd->copy()->addMinutes(30));
    }

    protected function resolveScheduledEnd($schedule, Carbon $now): ?Carbon
    {
        $weeklyData = $schedule->weekly_data;

        if (is_string($weeklyData)) {
            $weeklyData = json_decode($weeklyData, true);
        }

        if (is_array($weeklyData)) {
            $day = collect($weeklyData)->first(
                fn ($row) => (int) ($row['day_of_week'] ?? $row['dayOfWeek'] ?? -1) === $now->dayOfWeek
            );

            $end = $day['shift_end'] ?? $day['shiftEnd'] ?? $day['end'] ?? null;
            if ($end) {
                try {
                    return Carbon::parse($now->toDateString().' '.$end);
                } catch (\Throwable) {
                    return null;
                }
            }
        }

        $fallback = $schedule->shift_end ?? null;
        if (! $fallback) {
            return null;
        }

        try {
            return Carbon::parse($now->toDateString().' '.$fallback);
        } catch (\Throwable) {
            return null;
        }
    }
}
