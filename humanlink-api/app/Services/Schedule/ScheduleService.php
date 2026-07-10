<?php

declare(strict_types=1);

namespace App\Services\Schedule;

use App\Contracts\ScheduleServiceInterface;
use App\Models\Schedule;
use Illuminate\Database\Eloquent\Collection;

class ScheduleService implements ScheduleServiceInterface
{
    /**
     * @return array{data: Collection, meta: array{start: string, end: string}}
     */
    public function list(?string $start = null, ?string $end = null): array
    {
        $start ??= now()->startOfMonth()->toDateString();
        $end ??= now()->endOfMonth()->toDateString();

        $schedules = Schedule::query()
            ->with('user:id,name')
            ->where(function ($q) use ($start, $end): void {
                $q->where('start_date', '<=', $end)
                    ->where(function ($query) use ($start): void {
                        $query->whereNull('end_date')
                            ->orWhere('end_date', '>=', $start);
                    });
            })
            ->latest()
            ->get();

        return [
            'data' => $schedules,
            'meta' => [
                'start' => $start,
                'end' => $end,
            ],
        ];
    }
}
