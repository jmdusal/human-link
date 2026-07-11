<?php

declare(strict_types=1);

namespace App\Services\LeaveBalance;

use App\Contracts\LeaveBalanceServiceInterface;
use App\Models\LeaveBalance;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class LeaveBalanceService implements LeaveBalanceServiceInterface
{
    public function list(): Collection
    {
        $query = LeaveBalance::query()
            ->with(['user', 'leavePolicy'])
            ->latest();

        if (! $this->canManageBalances()) {
            $query->where('user_id', Auth::id());
        }

        return $query->get();
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

    protected function canManageBalances(?User $user = null): bool
    {
        $user ??= Auth::user();

        if (! $user) {
            return false;
        }

        return $user->hasRole('super-admin')
            || $user->hasRole('hr-manager')
            || $user->can('leave-balances-edit')
            || $user->can('users-edit');
    }
}
