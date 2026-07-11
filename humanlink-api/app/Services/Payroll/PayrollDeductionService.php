<?php

declare(strict_types=1);

namespace App\Services\Payroll;

use App\Models\PayrollDeduction;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PayrollDeductionService
{
    public function list(?int $userId = null): Collection
    {
        $query = PayrollDeduction::query()->with('user:id,name,email')->orderByDesc('id');

        if ($userId) {
            $query->where('user_id', $userId);
        }

        if (! $this->canManage()) {
            $query->where('user_id', Auth::id());
        }

        return $query->get();
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): PayrollDeduction
    {
        return DB::transaction(fn () => PayrollDeduction::query()->create($data)->load('user:id,name,email'));
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(PayrollDeduction $deduction, array $data): PayrollDeduction
    {
        return DB::transaction(function () use ($deduction, $data) {
            $deduction->update($data);

            return $deduction->fresh()->load('user:id,name,email');
        });
    }

    public function delete(PayrollDeduction $deduction): void
    {
        DB::transaction(fn () => $deduction->delete());
    }

    protected function canManage(?User $user = null): bool
    {
        $user ??= Auth::user();

        if (! $user) {
            return false;
        }

        return $user->isElevatedStaff() || $user->can('users-edit');
    }
}
