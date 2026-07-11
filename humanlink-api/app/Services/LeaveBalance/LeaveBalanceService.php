<?php

declare(strict_types=1);

namespace App\Services\LeaveBalance;

use App\Contracts\LeaveBalanceServiceInterface;
use App\Models\LeaveBalance;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class LeaveBalanceService implements LeaveBalanceServiceInterface
{
    public function list(): Collection
    {
        $query = LeaveBalance::query()
            ->with(['user', 'leavePolicy'])
            ->latest();

        $ids = Auth::user()?->reportableUserIds();

        if ($ids !== null) {
            $query->whereIn('user_id', $ids);
        }

        return $query->get();
    }

    public function create(array $data): LeaveBalance
    {
        $actor = Auth::user();
        $userId = (int) $data['user_id'];

        if ($actor && ! $actor->canAccessUserId($userId)) {
            throw ValidationException::withMessages([
                'user_id' => ['User does not belong to your company.'],
            ]);
        }

        return DB::transaction(function () use ($data): LeaveBalance {
            return LeaveBalance::create($data)->load(['user', 'leavePolicy']);
        });
    }

    public function update(LeaveBalance $leaveBalance, array $data): LeaveBalance
    {
        $this->assertCanAccessBalance($leaveBalance);

        return DB::transaction(function () use ($leaveBalance, $data): LeaveBalance {
            $leaveBalance->update($data);

            return $leaveBalance->load(['user', 'leavePolicy']);
        });
    }

    public function delete(LeaveBalance $leaveBalance): void
    {
        $this->assertCanAccessBalance($leaveBalance);

        DB::transaction(fn () => $leaveBalance->delete());
    }

    protected function assertCanAccessBalance(LeaveBalance $leaveBalance): void
    {
        $actor = Auth::user();

        if (! $actor || ! $actor->canAccessUserId((int) $leaveBalance->user_id)) {
            abort(403, 'Leave balance does not belong to your company.');
        }
    }

    protected function canManageBalances(?User $user = null): bool
    {
        $user ??= Auth::user();

        if (! $user) {
            return false;
        }

        return $user->isElevatedStaff()
            || $user->can('leave-balances-edit')
            || $user->can('users-edit');
    }
}
