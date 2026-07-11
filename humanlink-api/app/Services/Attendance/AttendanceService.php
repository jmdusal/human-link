<?php

declare(strict_types=1);

namespace App\Services\Attendance;

use App\Contracts\AttendanceServiceInterface;
use App\Events\AttendanceTimerUpdated;
use App\Models\Attendance;
use App\Models\AttendanceBreak;
use App\Models\Schedule;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AttendanceService implements AttendanceServiceInterface
{
    private const DEFAULT_REQUIRED_MS = 7 * 60 * 60 * 1000; // 8h shift - 1h break

    public function list(?string $start = null, ?string $end = null): array
    {
        $start ??= now()->startOfMonth()->toDateString();
        $end ??= now()->endOfMonth()->toDateString();

        $query = Attendance::query()
            ->with(['user:id,name,email,timer_status', 'breaks'])
            ->whereBetween('date', [$start, $end]);

        if (! $this->canManageAttendances()) {
            $query->where('user_id', Auth::id());
        }

        $attendances = $query->orderBy('date')->get();

        return [
            'data' => $attendances,
            'meta' => [
                'start' => $start,
                'end' => $end,
            ],
        ];
    }

    public function status(): array
    {
        /** @var User $user */
        $user = Auth::user();
        $this->syncDayBoundary($user);

        return $this->timerPayload($user->fresh());
    }

    public function start(): array
    {
        /** @var User $user */
        $user = Auth::user();

        return DB::transaction(function () use ($user): array {
            $user = User::query()->lockForUpdate()->findOrFail($user->id);
            $this->syncDayBoundary($user);

            if ($user->timer_status === 'working') {
                return $this->timerPayload($user);
            }

            if ($user->timer_status === 'paused') {
                throw ValidationException::withMessages([
                    'timer' => ['Timer is paused. Resume instead of starting again.'],
                ]);
            }

            $now = now();
            $attendance = $this->todayAttendance($user);
            $scheduleMeta = $this->scheduleMetaForUser($user, 0);

            if ($attendance && $attendance->status === 'completed') {
                throw ValidationException::withMessages([
                    'timer' => ['Attendance for today was stopped. Use Continue to keep tracking time.'],
                ]);
            }

            $schedulePayload = [
                'scheduled_start' => $scheduleMeta['shift_start'],
                'scheduled_end' => $scheduleMeta['shift_end'],
                'required_ms' => $scheduleMeta['required_ms'],
            ];

            if (! $attendance) {
                $attendance = Attendance::query()->create([
                    'user_id' => $user->id,
                    'date' => $now->toDateString(),
                    'started_at' => $now,
                    'total_ms' => 0,
                    'status' => 'working',
                    ...$schedulePayload,
                ]);
            } else {
                $attendance->update([
                    'status' => 'working',
                    'ended_at' => null,
                    'started_at' => $attendance->started_at ?? $now,
                    ...$schedulePayload,
                ]);
            }

            $user->update([
                'timer_status' => 'working',
                'timer_started_at' => $now,
                'timer_accumulated_ms' => (int) $attendance->total_ms,
            ]);

            return $this->broadcastAndReturn($user->fresh(), $attendance->fresh());
        });
    }

    public function pause(): array
    {
        /** @var User $user */
        $user = Auth::user();

        return DB::transaction(function () use ($user): array {
            $user = User::query()->lockForUpdate()->findOrFail($user->id);
            $this->syncDayBoundary($user);

            if ($user->timer_status !== 'working') {
                throw ValidationException::withMessages([
                    'timer' => ['Timer is not running.'],
                ]);
            }

            $elapsed = $this->segmentElapsedMs($user);
            $accumulated = (int) $user->timer_accumulated_ms + $elapsed;
            $attendance = $this->todayAttendance($user);
            $now = now();

            $user->update([
                'timer_status' => 'paused',
                'timer_started_at' => null,
                'timer_accumulated_ms' => $accumulated,
            ]);

            if ($attendance) {
                $attendance->update([
                    'total_ms' => $accumulated,
                    'status' => 'paused',
                ]);

                AttendanceBreak::query()->create([
                    'attendance_id' => $attendance->id,
                    'paused_at' => $now,
                    'resumed_at' => null,
                    'duration_ms' => 0,
                ]);
            }

            return $this->broadcastAndReturn($user->fresh(), $attendance?->fresh());
        });
    }

    public function resume(): array
    {
        /** @var User $user */
        $user = Auth::user();

        return DB::transaction(function () use ($user): array {
            $user = User::query()->lockForUpdate()->findOrFail($user->id);
            $this->syncDayBoundary($user);

            if ($user->timer_status !== 'paused') {
                throw ValidationException::withMessages([
                    'timer' => ['Timer is not paused.'],
                ]);
            }

            $now = now();
            $attendance = $this->todayAttendance($user);

            $user->update([
                'timer_status' => 'working',
                'timer_started_at' => $now,
            ]);

            if ($attendance) {
                $openBreak = AttendanceBreak::query()
                    ->where('attendance_id', $attendance->id)
                    ->whereNull('resumed_at')
                    ->latest('paused_at')
                    ->first();

                if ($openBreak) {
                    $durationMs = (int) max(0, $now->getTimestampMs() - $openBreak->paused_at->getTimestampMs());
                    $openBreak->update([
                        'resumed_at' => $now,
                        'duration_ms' => $durationMs,
                    ]);

                    $attendance->update([
                        'status' => 'working',
                        'ended_at' => null,
                        'break_ms' => (int) $attendance->break_ms + $durationMs,
                    ]);
                } else {
                    $attendance->update([
                        'status' => 'working',
                        'ended_at' => null,
                    ]);
                }
            }

            return $this->broadcastAndReturn($user->fresh(), $attendance?->fresh());
        });
    }

    public function end(): array
    {
        /** @var User $user */
        $user = Auth::user();

        return DB::transaction(function () use ($user): array {
            $user = User::query()->lockForUpdate()->findOrFail($user->id);
            $this->syncDayBoundary($user);

            if (! in_array($user->timer_status, ['working', 'paused'], true)) {
                throw ValidationException::withMessages([
                    'timer' => ['No active attendance to end.'],
                ]);
            }

            $elapsed = (int) $user->timer_accumulated_ms;
            if ($user->timer_status === 'working') {
                $elapsed += $this->segmentElapsedMs($user);
            }

            $scheduleMeta = $this->scheduleMetaForUser($user, $elapsed);
            $attendance = $this->todayAttendance($user);
            $now = now();

            if ($attendance && $user->timer_status === 'paused') {
                $openBreak = AttendanceBreak::query()
                    ->where('attendance_id', $attendance->id)
                    ->whereNull('resumed_at')
                    ->latest('paused_at')
                    ->first();

                if ($openBreak) {
                    $durationMs = (int) max(0, $now->getTimestampMs() - $openBreak->paused_at->getTimestampMs());
                    $openBreak->update([
                        'resumed_at' => $now,
                        'duration_ms' => $durationMs,
                    ]);
                    $attendance->break_ms = (int) $attendance->break_ms + $durationMs;
                }
            }

            $user->update([
                'timer_status' => 'offline',
                'timer_started_at' => null,
                'timer_accumulated_ms' => $elapsed,
            ]);

            if ($attendance) {
                $metrics = $this->computeComplianceMetrics($attendance, $elapsed, $scheduleMeta, $now);

                $attendance->update([
                    'total_ms' => $elapsed,
                    'status' => 'completed',
                    'ended_at' => $now,
                    'break_ms' => (int) $attendance->break_ms,
                    'required_ms' => $scheduleMeta['required_ms'],
                    'scheduled_start' => $scheduleMeta['shift_start'],
                    'scheduled_end' => $scheduleMeta['shift_end'],
                    ...$metrics,
                ]);
            }

            return $this->broadcastAndReturn($user->fresh(), $attendance?->fresh());
        });
    }

    public function continueAttendance(): array
    {
        /** @var User $user */
        $user = Auth::user();

        return DB::transaction(function () use ($user): array {
            $user = User::query()->lockForUpdate()->findOrFail($user->id);
            $this->syncDayBoundary($user);

            if ($user->timer_status !== 'offline') {
                throw ValidationException::withMessages([
                    'timer' => ['Timer is already active. Use resume if paused.'],
                ]);
            }

            $today = now()->toDateString();
            $attendance = $this->todayAttendance($user);

            if (! $attendance || $attendance->status !== 'completed') {
                throw ValidationException::withMessages([
                    'timer' => ['No stopped attendance for today to continue. Previous days cannot be continued.'],
                ]);
            }

            if ($attendance->date->toDateString() !== $today) {
                throw ValidationException::withMessages([
                    'timer' => ['You can only continue attendance on the same shift day you stopped. Start a new timer for today instead.'],
                ]);
            }

            $now = now();
            $accumulated = (int) $attendance->total_ms;
            $scheduleMeta = $this->scheduleMetaForUser($user, $accumulated);

            $attendance->update([
                'status' => 'working',
                'ended_at' => null,
                'undertime_ms' => 0,
                'overtime_ms' => 0,
                'required_ms' => $scheduleMeta['required_ms'],
                'scheduled_start' => $scheduleMeta['shift_start'],
                'scheduled_end' => $scheduleMeta['shift_end'],
            ]);

            $user->update([
                'timer_status' => 'working',
                'timer_started_at' => $now,
                'timer_accumulated_ms' => $accumulated,
            ]);

            return $this->broadcastAndReturn($user->fresh(), $attendance->fresh());
        });
    }

    /**
     * @param  array<string, mixed>  $scheduleMeta
     * @return array{late_ms: int, undertime_ms: int, overtime_ms: int}
     */
    protected function computeComplianceMetrics(
        Attendance $attendance,
        int $elapsedMs,
        array $scheduleMeta,
        Carbon $endedAt,
    ): array {
        $requiredMs = (int) $scheduleMeta['required_ms'];
        $lateMs = 0;
        $overtimeMs = max(0, $elapsedMs - $requiredMs);
        $undertimeMs = max(0, $requiredMs - $elapsedMs);

        if ($attendance->started_at && ! empty($scheduleMeta['shift_start'])) {
            $scheduledStart = Carbon::parse(
                $attendance->date->toDateString().' '.$scheduleMeta['shift_start']
            );
            $lateMs = (int) max(0, $attendance->started_at->getTimestampMs() - $scheduledStart->getTimestampMs());
        }

        if (! empty($scheduleMeta['shift_end']) && $attendance->started_at) {
            $scheduledEnd = Carbon::parse(
                $attendance->date->toDateString().' '.$scheduleMeta['shift_end']
            );
            if ($endedAt->greaterThan($scheduledEnd)) {
                $pastEndMs = (int) max(0, $endedAt->getTimestampMs() - $scheduledEnd->getTimestampMs());
                $overtimeMs = max($overtimeMs, $pastEndMs);
            }
        }

        return [
            'late_ms' => $lateMs,
            'undertime_ms' => $undertimeMs,
            'overtime_ms' => $overtimeMs,
        ];
    }

    protected function syncDayBoundary(User $user): void
    {
        $today = now()->toDateString();
        $todayAttendance = $this->todayAttendance($user);

        // New calendar day: leftover stop/continue state from yesterday must not carry over.
        if ($user->timer_status === 'offline' && ! $todayAttendance) {
            if ($user->timer_started_at || (int) $user->timer_accumulated_ms > 0) {
                $user->update([
                    'timer_started_at' => null,
                    'timer_accumulated_ms' => 0,
                ]);
                $user->refresh();
            }

            return;
        }

        if (! $user->timer_started_at && (int) $user->timer_accumulated_ms === 0 && $user->timer_status === 'offline') {
            return;
        }

        $timerDay = $user->timer_started_at
            ? Carbon::parse($user->timer_started_at)->toDateString()
            : null;

        if ($timerDay && $timerDay !== $today) {
            $this->finalizePreviousDay($user, $timerDay);

            return;
        }

        if ($todayAttendance && $todayAttendance->date->toDateString() !== $today && $user->timer_status !== 'offline') {
            $this->finalizePreviousDay($user, $todayAttendance->date->toDateString());
        }
    }

    protected function finalizePreviousDay(User $user, string $date): void
    {
        $attendance = Attendance::query()
            ->where('user_id', $user->id)
            ->whereDate('date', $date)
            ->first();

        $total = (int) $user->timer_accumulated_ms;

        if ($user->timer_status === 'working' && $user->timer_started_at) {
            $total += $this->segmentElapsedMs($user);
        }

        if ($attendance) {
            $scheduleMeta = $this->scheduleMetaForUserOnDate($user, $date, $total);
            $endedAt = $attendance->ended_at ?? now();
            $metrics = $this->computeComplianceMetrics($attendance, $total, $scheduleMeta, Carbon::parse($endedAt));

            $attendance->update([
                'total_ms' => $total,
                'status' => 'completed',
                'ended_at' => $endedAt,
                'required_ms' => $scheduleMeta['required_ms'],
                'scheduled_start' => $scheduleMeta['shift_start'],
                'scheduled_end' => $scheduleMeta['shift_end'],
                ...$metrics,
            ]);
        }

        $user->update([
            'timer_status' => 'offline',
            'timer_started_at' => null,
            'timer_accumulated_ms' => 0,
        ]);
    }

    protected function todayAttendance(User $user): ?Attendance
    {
        return Attendance::query()
            ->where('user_id', $user->id)
            ->whereDate('date', now()->toDateString())
            ->first();
    }

    protected function segmentElapsedMs(User $user): int
    {
        if (! $user->timer_started_at) {
            return 0;
        }

        $startedMs = Carbon::parse($user->timer_started_at)->getTimestampMs();

        return (int) max(0, now()->getTimestampMs() - $startedMs);
    }

    /**
     * @return array<string, mixed>
     */
    protected function scheduleMetaForUser(User $user, int $elapsedMs): array
    {
        return $this->scheduleMetaForUserOnDate($user, now()->toDateString(), $elapsedMs);
    }

    /**
     * @return array<string, mixed>
     */
    protected function scheduleMetaForUserOnDate(User $user, string $date, int $elapsedMs): array
    {
        $user->loadMissing('schedule');
        /** @var Schedule|null $schedule */
        $schedule = $user->schedule;
        $dayOfWeek = (int) Carbon::parse($date)->dayOfWeek;

        $shiftStart = '09:00';
        $shiftEnd = '17:00';
        $breakMinutes = 60;
        $isRestDay = false;

        if ($schedule) {
            $breakMinutes = (int) ($schedule->break_minutes ?? 60);
            $weekly = collect($schedule->weekly_data ?? []);
            $today = $weekly->first(fn ($day) => (int) ($day['dayOfWeek'] ?? -1) === $dayOfWeek);

            if ($today) {
                $shiftStart = (string) ($today['shiftStart'] ?? '09:00');
                $shiftEnd = (string) ($today['shiftEnd'] ?? '17:00');
                $isRestDay = (bool) ($today['isRestDay'] ?? false);
            }
        }

        $requiredMs = $isRestDay
            ? 0
            : $this->requiredMsFromShift($shiftStart, $shiftEnd, $breakMinutes);

        $remainingMs = max(0, $requiredMs - $elapsedMs);
        $isActive = in_array($user->timer_status, ['working', 'paused'], true);
        $canEnd = $isActive && $requiredMs > 0 && $elapsedMs >= $requiredMs;
        $canStop = $isActive;

        return [
            'shift_start' => $shiftStart,
            'shift_end' => $shiftEnd,
            'break_minutes' => $breakMinutes,
            'is_rest_day' => $isRestDay,
            'required_ms' => $requiredMs,
            'remaining_ms' => $remainingMs,
            'can_end' => $canEnd,
            'can_stop' => $canStop,
        ];
    }

    protected function requiredMsFromShift(string $shiftStart, string $shiftEnd, int $breakMinutes): int
    {
        $start = Carbon::createFromFormat('H:i', substr($shiftStart, 0, 5));
        $end = Carbon::createFromFormat('H:i', substr($shiftEnd, 0, 5));

        if (! $start || ! $end) {
            return self::DEFAULT_REQUIRED_MS;
        }

        if ($end->lessThanOrEqualTo($start)) {
            $end->addDay();
        }

        $shiftMinutes = (int) $start->diffInMinutes($end);
        $workMinutes = max(0, $shiftMinutes - max(0, $breakMinutes));

        if ($workMinutes <= 0) {
            return self::DEFAULT_REQUIRED_MS;
        }

        return $workMinutes * 60 * 1000;
    }

    /**
     * @return array<string, mixed>
     */
    protected function timerPayload(?User $user, ?Attendance $attendance = null): array
    {
        $user ??= Auth::user();
        $attendance ??= $this->todayAttendance($user);

        $elapsed = (int) $user->timer_accumulated_ms;

        if ($user->timer_status === 'working') {
            $elapsed += $this->segmentElapsedMs($user);
        }

        $schedule = $this->scheduleMetaForUser($user, $elapsed);
        $today = now()->toDateString();
        $isSameShiftDay = $attendance
            && $attendance->date->toDateString() === $today;
        // Continue is same calendar/shift day only — never after the date rolls over.
        $canContinue = $user->timer_status === 'offline'
            && $isSameShiftDay
            && $attendance->status === 'completed';

        return [
            'timer_status' => $user->timer_status,
            'timer_started_at' => $user->timer_started_at
                ? Carbon::parse($user->timer_started_at)->toIso8601String()
                : null,
            'timer_accumulated_ms' => (int) $user->timer_accumulated_ms,
            'elapsed_ms' => $isSameShiftDay || $user->timer_status !== 'offline'
                ? $elapsed
                : 0,
            'server_time' => now()->toIso8601String(),
            'attendance' => $isSameShiftDay ? $attendance?->loadMissing('breaks') : null,
            'schedule' => $schedule,
            'can_continue' => $canContinue,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    protected function broadcastAndReturn(User $user, ?Attendance $attendance): array
    {
        $payload = $this->timerPayload($user, $attendance);

        broadcast(new AttendanceTimerUpdated($user, $payload));

        return $payload;
    }

    protected function canManageAttendances(?User $user = null): bool
    {
        $user ??= Auth::user();

        if (! $user) {
            return false;
        }

        return $user->isElevatedStaff() || $user->can('users-edit');
    }
}
