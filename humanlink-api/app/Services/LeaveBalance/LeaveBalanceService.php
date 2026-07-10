<?php

declare(strict_types=1);

namespace App\Services\LeaveBalance;

use App\Contracts\LeaveBalanceServiceInterface;
use App\Models\LeaveBalance;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class LeaveBalanceService implements LeaveBalanceServiceInterface
{
    public function list(): Collection
    {
        return LeaveBalance::query()
            ->with(['user', 'leavePolicy'])
            ->latest()
            ->get();
    }

    public function create(array $data): LeaveBalance
    {
        return DB::transaction(function () use ($data): LeaveBalance {
            return LeaveBalance::create($data)->load(['user', 'leavePolicy']);
        });
    }

    public function update(LeaveBalance $leaveBalance, array $data): LeaveBalance
    {
        return DB::transaction(function () use ($leaveBalance, $data): LeaveBalance {
            $leaveBalance->update($data);

            return $leaveBalance->load(['user', 'leavePolicy']);
        });
    }

    public function delete(LeaveBalance $leaveBalance): void
    {
        DB::transaction(fn () => $leaveBalance->delete());
    }
}
