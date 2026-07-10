<?php

declare(strict_types=1);

namespace App\Services\User\Concerns;

use App\Models\User;

trait ManagesUserRates
{
    protected function syncUserRate(User $user, array $data): void
    {
        if (! $this->hasRateFields($data)) {
            return;
        }

        $user->rate()->updateOrCreate(
            ['user_id' => $user->id],
            $this->ratePayload($data)
        );
    }

    protected function createUserRate(User $user, array $data): void
    {
        if (! isset($data['monthly_rate'])) {
            return;
        }

        $user->rate()->create($this->ratePayload($data));
    }

    protected function hasRateFields(array $data): bool
    {
        return isset($data['monthly_rate'])
            || isset($data['daily_rate'])
            || isset($data['hourly_rate']);
    }

    protected function ratePayload(array $data): array
    {
        return array_intersect_key($data, array_flip([
            'monthly_rate',
            'daily_rate',
            'hourly_rate',
            'allowance_monthly',
            'effective_date',
            'is_active',
        ]));
    }
}
