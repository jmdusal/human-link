<?php

declare(strict_types=1);

namespace App\Services\Payroll;

use App\Models\PayrollDeduction;
use App\Models\User;
use App\Support\CompanyContext;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PayrollDeductionService
{
    public function __construct(
        private CompanyContext $companyContext
    ) {}

    public function list(?int $userId = null): Collection
    {
        $query = PayrollDeduction::query()->with('user:id,name,email')->orderByDesc('id');

        $this->companyContext->constrain($query);

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
        $user = User::query()->findOrFail((int) $data['user_id']);

        if ($this->companyContext->shouldScope() && (int) $user->company_id !== $this->companyContext->requireId()) {
            throw ValidationException::withMessages([
                'user_id' => ['User does not belong to your company.'],
            ]);
        }

        $data['company_id'] = $user->company_id;

        return DB::transaction(fn () => PayrollDeduction::query()->create($data)->load('user:id,name,email'));
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(PayrollDeduction $deduction, array $data): PayrollDeduction
    {
        $this->assertSameCompany($deduction);

        return DB::transaction(function () use ($deduction, $data) {
            unset($data['company_id']);

            $deduction->update($data);

            return $deduction->fresh()->load('user:id,name,email');
        });
    }

    public function delete(PayrollDeduction $deduction): void
    {
        $this->assertSameCompany($deduction);

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

    private function assertSameCompany(PayrollDeduction $deduction): void
    {
        if (! $this->companyContext->shouldScope()) {
            return;
        }

        if ((int) $deduction->company_id !== $this->companyContext->requireId()) {
            abort(403, 'Payroll deduction does not belong to your company.');
        }
    }
}
