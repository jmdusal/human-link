<?php

declare(strict_types=1);

namespace App\Services\Schedule;

use App\Contracts\ScheduleServiceInterface;
use App\Models\Schedule;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;

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
            ->with('user:id,name')
            ->where(function ($q) use ($start, $end): void {
                $q->where('start_date', '<=', $end)
                    ->where(function ($query) use ($start): void {
                        $query->whereNull('end_date')
                            ->orWhere('end_date', '>=', $start);
                    });
            });

        if (! $this->canManageSchedules()) {
            $query->where('user_id', Auth::id());
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

    protected function canManageSchedules(?User $user = null): bool
    {
        $user ??= Auth::user();

        if (! $user) {
            return false;
        }

        return $user->hasRole('super-admin')
            || $user->hasRole('hr-manager')
            || $user->can('users-edit');
    }
}
