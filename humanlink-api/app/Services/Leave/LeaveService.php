<?php

declare(strict_types=1);

namespace App\Services\Leave;

use App\Contracts\LeaveServiceInterface;
use App\Models\LeaveBalance;
use App\Models\LeavePolicy;
use App\Models\LeaveRequest;
use App\Support\CompanyContext;
use Illuminate\Support\Facades\Auth;

class LeaveService implements LeaveServiceInterface
{
    public function __construct(
        private CompanyContext $companyContext
    ) {}

    public function dashboard(): array
    {
        $policiesQuery = LeavePolicy::query()->latest();
        $this->companyContext->constrain($policiesQuery);

        $balancesQuery = LeaveBalance::query()
            ->with(['user:id,name,email', 'leavePolicy:id,name'])
            ->where('year', date('Y'))
            ->latest();

        $requestsQuery = LeaveRequest::query()
            ->with(['user:id,name', 'leavePolicy:id,name'])
            ->latest();

        $ids = Auth::user()?->reportableUserIds();

        if ($ids !== null) {
            $balancesQuery->whereIn('user_id', $ids);
            $requestsQuery->whereIn('user_id', $ids);
        }

        return [
            'policies' => $policiesQuery->get(),
            'balances' => $balancesQuery->get(),
            'requests' => $requestsQuery->get(),
        ];
    }
}
