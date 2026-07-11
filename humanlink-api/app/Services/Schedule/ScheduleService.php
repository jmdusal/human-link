<?php

declare(strict_types=1);

namespace App\Services\Schedule;

use App\Contracts\ScheduleServiceInterface;
use App\Models\Schedule;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ScheduleService implements ScheduleServiceInterface
{
    /**
     * @return array{data: Collection, meta: array{start: string, end: string}}
     */
    public function list(?string $start = null, ?string $end = null): array
    {
        $start ??= now()->startOfMonth()->toDateString();
        $end ??= now()->endOfMonth()->toDateString();

        $query = Schedule::query()
            ->with('user:id,name,email')
            ->where(function ($q) use ($start, $end): void {
                $q->where('start_date', '<=', $end)
                    ->where(function ($query) use ($start): void {
                        $query->whereNull('end_date')
                            ->orWhere('end_date', '>=', $start);
                    });
            });

        $ids = Auth::user()?->reportableUserIds();

        if ($ids !== null) {
            $query->whereIn('user_id', $ids);
        }

        $schedules = $query->latest()->get();

        return [
            'data' => $schedules,
            'meta' => [
                'start' => $start,
                'end' => $end,
            ],
        ];
    }

    public function show(Schedule $schedule): Schedule
    {
        $this->authorizeScheduleAccess($schedule);

        return $schedule->load('user:id,name,email');
    }

    public function create(array $data): Schedule
    {
        $this->assertCanManage();

        $userId = (int) $data['user_id'];
        $actor = Auth::user();

        if ($actor && ! $actor->canAccessUserId($userId)) {
            throw ValidationException::withMessages([
                'user_id' => ['User does not belong to your company.'],
            ]);
        }

        return DB::transaction(function () use ($data, $userId): Schedule {
            $existing = Schedule::query()
                ->where('user_id', $userId)
                ->whereNull('end_date')
                ->first();

            if ($existing) {
                throw ValidationException::withMessages([
                    'user_id' => ['This user already has an active schedule. Edit it instead.'],
                ]);
            }

            $schedule = Schedule::query()->create([
                'user_id' => $userId,
                'weekly_data' => $data['weekly_data'],
                'start_date' => $data['start_date'],
                'end_date' => $data['end_date'] ?? null,
                'break_minutes' => $data['break_minutes'] ?? 60,
            ]);

            return $schedule->load('user:id,name,email');
        });
    }

    public function update(Schedule $schedule, array $data): Schedule
    {
        $this->assertCanManage();
        $this->authorizeScheduleAccess($schedule);

        $payload = [];

        if (array_key_exists('weekly_data', $data)) {
            $payload['weekly_data'] = $data['weekly_data'];
        }

        if (array_key_exists('start_date', $data)) {
            $payload['start_date'] = $data['start_date'];
        }

        if (array_key_exists('end_date', $data)) {
            $payload['end_date'] = $data['end_date'];
        }

        if (array_key_exists('break_minutes', $data)) {
            $payload['break_minutes'] = $data['break_minutes'];
        }

        $schedule->update($payload);

        return $schedule->fresh()->load('user:id,name,email');
    }

    public function delete(Schedule $schedule): void
    {
        $this->assertCanManage();
        $this->authorizeScheduleAccess($schedule);

        $schedule->delete();
    }

    protected function authorizeScheduleAccess(Schedule $schedule): void
    {
        $actor = Auth::user();

        if ($actor && $actor->canAccessUserId((int) $schedule->user_id)) {
            return;
        }

        abort(403, 'You are not allowed to view this schedule.');
    }

    protected function assertCanManage(): void
    {
        if (! $this->canManageSchedules()) {
            abort(403, 'You are not allowed to manage schedules.');
        }
    }

    protected function canManageSchedules(?User $user = null): bool
    {
        $user ??= Auth::user();

        if (! $user) {
            return false;
        }

        return $user->isElevatedStaff()
            || $user->can('users-edit')
            || $user->can('schedules-edit')
            || $user->can('schedules-create');
    }
}
