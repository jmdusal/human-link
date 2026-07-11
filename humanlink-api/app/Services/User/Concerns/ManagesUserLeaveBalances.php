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

        $policies = LeavePolicy::query()
            ->where('is_active', true)
            ->get();

        foreach ($policies as $policy) {
            $user->leaveBalances()->firstOrCreate(
                [
                    'leave_policy_id' => $policy->id,
                    'year' => $currentYear,
                ],
                [
                    'allowed' => $policy->default_credits,
                    'used' => 0.00,
                ]
            );
        }
    }
}
