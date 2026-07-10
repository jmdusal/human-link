<?php

declare(strict_types=1);

namespace App\Services\Leave;

use App\Contracts\LeaveServiceInterface;
use App\Models\LeaveBalance;
use App\Models\LeavePolicy;
use App\Models\LeaveRequest;

class LeaveService implements LeaveServiceInterface
{
    public function dashboard(): array
    {
        return [
            'policies' => LeavePolicy::query()->latest()->get(),
            'balances' => LeaveBalance::query()
                ->with(['user:id,name,email', 'leavePolicy:id,name'])
                ->where('year', date('Y'))
                ->latest()
                ->get(),
            'requests' => LeaveRequest::query()
                ->with(['user:id,name', 'leavePolicy:id,name'])
                ->latest()
                ->get(),
        ];
    }
}
