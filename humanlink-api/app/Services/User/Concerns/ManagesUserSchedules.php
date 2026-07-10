<?php

declare(strict_types=1);

namespace App\Services\User\Concerns;

use App\Models\User;

trait ManagesUserSchedules
{
    protected function createUserSchedule(User $user, array $data): void
    {
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
            'weekly_data' => $data['weekly_data'],
            'start_date' => $data['start_date'] ?? now()->format('Y-m-d'),
        ];
    }
}
