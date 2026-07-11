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
        if (! $this->hasCompleteRateFields($data)) {
            return;
        }

        $user->rate()->create($this->ratePayload($data));
    }

    protected function hasRateFields(array $data): bool
    {
        return filled($data['monthly_rate'] ?? null)
            || filled($data['daily_rate'] ?? null)
            || filled($data['hourly_rate'] ?? null);
    }

    protected function hasCompleteRateFields(array $data): bool
    {
        return filled($data['monthly_rate'] ?? null)
            && filled($data['daily_rate'] ?? null)
            && filled($data['hourly_rate'] ?? null);
    }

    protected function ratePayload(array $data): array
    {
        $payload = array_intersect_key($data, array_flip([
            'monthly_rate',
            'daily_rate',
            'hourly_rate',
            'allowance_monthly',
            'effective_date',
            'is_active',
        ]));

        if (! filled($payload['effective_date'] ?? null)) {
            $payload['effective_date'] = now()->toDateString();
        }

        if (! array_key_exists('is_active', $payload)) {
            $payload['is_active'] = true;
        }

        if (! filled($payload['allowance_monthly'] ?? null)) {
            $payload['allowance_monthly'] = 0;
        }

        return $payload;
    }
}
