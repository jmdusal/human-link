<?php

declare(strict_types=1);

namespace App\Events;

use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AttendanceTimerUpdated implements ShouldBroadcastNow
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    /**
     * @param  array{
     *     timer_status: string,
     *     timer_started_at: string|null,
     *     timer_accumulated_ms: int,
     *     elapsed_ms: int,
     *     attendance: array<string, mixed>|null
     * }  $timer
     */
    public function __construct(
        public User $user,
        public array $timer,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('App.Models.User.'.$this->user->id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'attendance.timer.updated';
    }

    /**
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        $attendance = $this->timer['attendance'] ?? null;

        return [
            'timerStatus' => $this->timer['timer_status'],
            'timerStartedAt' => $this->timer['timer_started_at'],
            'timerAccumulatedMs' => $this->timer['timer_accumulated_ms'],
            'elapsedMs' => $this->timer['elapsed_ms'],
            'serverTime' => $this->timer['server_time'] ?? null,
            'attendance' => $attendance ? [
                'id' => $attendance->id,
                'userId' => $attendance->user_id,
                'date' => $attendance->date?->toDateString(),
                'startedAt' => $attendance->started_at?->toIso8601String(),
                'endedAt' => $attendance->ended_at?->toIso8601String(),
                'totalMs' => (int) $attendance->total_ms,
                'status' => $attendance->status,
            ] : null,
            'schedule' => isset($this->timer['schedule']) ? [
                'shiftStart' => $this->timer['schedule']['shift_start'] ?? null,
                'shiftEnd' => $this->timer['schedule']['shift_end'] ?? null,
                'breakMinutes' => $this->timer['schedule']['break_minutes'] ?? 0,
                'isRestDay' => (bool) ($this->timer['schedule']['is_rest_day'] ?? false),
                'requiredMs' => (int) ($this->timer['schedule']['required_ms'] ?? 0),
                'remainingMs' => (int) ($this->timer['schedule']['remaining_ms'] ?? 0),
                'canEnd' => (bool) ($this->timer['schedule']['can_end'] ?? false),
            ] : null,
        ];
    }
}
