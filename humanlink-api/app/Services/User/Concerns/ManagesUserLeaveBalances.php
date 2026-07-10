<?php

declare(strict_types=1);

namespace App\Services\User\Concerns;

use App\Models\LeavePolicy;
use App\Models\User;

trait ManagesUserLeaveBalances
{
    protected function assignActiveLeaveBalances(User $user): void
    {
        $currentYear = (int) date('Y');

        $balances = LeavePolicy::query()
            ->where('is_active', true)
            ->get()
            ->map(fn (LeavePolicy $policy): array => [
                'leave_policy_id' => $policy->id,
                'allowed' => $policy->default_credits,
                'used' => 0.00,
                'year' => $currentYear,
            ])
            ->all();

        if ($balances !== []) {
            $user->leaveBalances()->createMany($balances);
        }
    }
}
