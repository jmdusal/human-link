<?php

declare(strict_types=1);

namespace App\Services\User\Concerns;

use App\Models\User;

trait ManagesUserSchedules
{
    protected function createUserSchedule(User $user, array $data): void
    {
        if (! isset($data['weekly_data']) || ! is_array($data['weekly_data'])) {
            return;
        }

        $user->schedule()->create($this->schedulePayload($data));
    }

    protected function syncUserSchedule(User $user, array $data): void
    {
        if (! isset($data['weekly_data'])) {
            return;
        }

        $user->schedule()->updateOrCreate(
            ['user_id' => $user->id],
            $this->schedulePayload($data)
        );
    }

    protected function schedulePayload(array $data): array
    {
        return [
            'weekly_data' => $this->normalizeWeeklyData($data['weekly_data'] ?? []),
            'start_date' => $data['start_date'] ?? now()->format('Y-m-d'),
        ];
    }

    /**
     * @param  array<int, mixed>  $weeklyData
     * @return array<int, array<string, mixed>>
     */
    protected function normalizeWeeklyData(array $weeklyData): array
    {
        return collect($weeklyData)
            ->map(function (mixed $day): array {
                $day = (array) $day;

                return [
                    'day_of_week' => (int) ($day['day_of_week'] ?? $day['dayOfWeek'] ?? 0),
                    'shift_start' => $this->normalizeTime((string) ($day['shift_start'] ?? $day['shiftStart'] ?? '08:00')),
                    'shift_end' => $this->normalizeTime((string) ($day['shift_end'] ?? $day['shiftEnd'] ?? '17:00')),
                    'is_rest_day' => (bool) ($day['is_rest_day'] ?? $day['isRestDay'] ?? $day['is_rest'] ?? false),
                    'is_night_shift' => (bool) ($day['is_night_shift'] ?? $day['isNightShift'] ?? $day['is_night'] ?? false),
                ];
            })
            ->values()
            ->all();
    }

    protected function normalizeTime(string $time): string
    {
        if (preg_match('/^\d{2}:\d{2}/', $time, $matches) === 1) {
            return $matches[0];
        }

        return '08:00';
    }
}
