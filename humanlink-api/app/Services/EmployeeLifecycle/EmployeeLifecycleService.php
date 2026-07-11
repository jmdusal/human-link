<?php

declare(strict_types=1);

namespace App\Services\EmployeeLifecycle;

use App\Contracts\EmployeeLifecycleServiceInterface;
use App\Contracts\PayrollServiceInterface;
use App\Models\EmployeeChecklist;
use App\Models\EmployeeChecklistItem;
use App\Models\LeaveBalance;
use App\Models\Payslip;
use App\Models\User;
use App\Models\WorkspaceUser;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class EmployeeLifecycleService implements EmployeeLifecycleServiceInterface
{
    public const ONBOARD_ITEMS = [
        'create_account' => 'Create account',
        'assign_role' => 'Assign role',
        'set_rates' => 'Set rates',
        'set_schedule' => 'Set schedule',
        'assign_leave_balances' => 'Assign leave balances',
        'workspace_access' => 'Workspace access',
        'welcome_complete' => 'Welcome complete',
    ];

    public const OFFBOARD_ITEMS = [
        'resign_notice' => 'Resign notice',
        'access_revoke' => 'Revoke access',
        'final_payslip' => 'Final payslip',
        'leave_payout' => 'Leave payout',
        'exit_interview' => 'Exit interview',
        'deactivate_account' => 'Deactivate account',
    ];

    public function __construct(
        private PayrollServiceInterface $payrollService
    ) {}

    public function getLifecycle(User $user): array
    {
        $onboard = $this->ensureOnboardChecklist($user);
        $offboard = EmployeeChecklist::query()
            ->with('items')
            ->where('user_id', $user->id)
            ->where('type', 'offboard')
            ->first();

        return [
            'onboard' => $onboard->load('items'),
            'offboard' => $offboard,
        ];
    }

    public function ensureOnboardChecklist(User $user): EmployeeChecklist
    {
        $existing = EmployeeChecklist::query()
            ->with('items')
            ->where('user_id', $user->id)
            ->where('type', 'onboard')
            ->first();

        if ($existing) {
            return $existing;
        }

        return $this->createChecklist($user, 'onboard', self::ONBOARD_ITEMS);
    }

    public function toggleItem(User $user, EmployeeChecklistItem $item): EmployeeChecklistItem
    {
        $checklist = $item->checklist;

        if (! $checklist || (int) $checklist->user_id !== (int) $user->id) {
            abort(404, 'Checklist item not found for this user.');
        }

        $isDone = ! $item->is_done;

        $item->update([
            'is_done' => $isDone,
            'done_at' => $isDone ? now() : null,
            'done_by' => $isDone ? Auth::id() : null,
        ]);

        $this->syncChecklistStatus($checklist->fresh('items'));

        return $item->fresh(['doneBy:id,name', 'checklist']);
    }

    public function offboard(User $user, array $data): array
    {
        $terminatedAt = Carbon::parse($data['terminated_at'])->startOfDay();
        $generateFinalPayslip = (bool) ($data['generate_final_payslip'] ?? false);
        $includeLeavePayout = (bool) ($data['include_leave_payout'] ?? false);
        $notes = $data['notes'] ?? null;

        return DB::transaction(function () use (
            $user,
            $terminatedAt,
            $generateFinalPayslip,
            $includeLeavePayout,
            $notes
        ): array {
            $checklist = $this->ensureOffboardChecklist($user);

            if ($notes !== null) {
                $checklist->update(['notes' => $notes]);
            }

            $user->update([
                'terminated_at' => $terminatedAt->toDateString(),
                'status' => 'inactive',
                'timer_status' => 'offline',
                'timer_started_at' => null,
                'timer_accumulated_ms' => 0,
            ]);

            if (method_exists($user, 'tokens')) {
                $user->tokens()->delete();
            }

            WorkspaceUser::query()->where('user_id', $user->id)->delete();

            $this->markChecklistItemsDone($checklist, ['access_revoke', 'deactivate_account']);

            $payslip = null;

            if ($generateFinalPayslip) {
                $payslip = $this->payrollService->generateForUser(
                    $user->id,
                    (int) $terminatedAt->year,
                    (int) $terminatedAt->month,
                );
                $this->markChecklistItemsDone($checklist, ['final_payslip']);
            }

            if ($includeLeavePayout) {
                $payslip ??= $this->payrollService->generateForUser(
                    $user->id,
                    (int) $terminatedAt->year,
                    (int) $terminatedAt->month,
                );

                $payoutAmount = $this->calculateLeavePayout($user, (int) $terminatedAt->year);

                if ($payoutAmount > 0) {
                    $this->payrollService->addAdjustment($payslip, [
                        'type' => 'earning',
                        'label' => 'Leave payout',
                        'amount' => $payoutAmount,
                        'reason' => 'Unused paid leave payout on offboarding',
                    ]);
                    $payslip = $payslip->fresh(['adjustments.creator:id,name', 'user:id,name,email']);
                }

                $this->markChecklistItemsDone($checklist, ['leave_payout']);
            }

            return [
                'user' => $user->fresh(['roles', 'rate', 'schedule', 'checklists.items']),
                'checklist' => $checklist->fresh('items'),
                'payslip' => $payslip,
            ];
        });
    }

    protected function ensureOffboardChecklist(User $user): EmployeeChecklist
    {
        $existing = EmployeeChecklist::query()
            ->with('items')
            ->where('user_id', $user->id)
            ->where('type', 'offboard')
            ->first();

        if ($existing) {
            return $existing;
        }

        return $this->createChecklist($user, 'offboard', self::OFFBOARD_ITEMS);
    }

    /**
     * @param  array<string, string>  $items
     */
    protected function createChecklist(User $user, string $type, array $items): EmployeeChecklist
    {
        $checklist = EmployeeChecklist::query()->create([
            'user_id' => $user->id,
            'type' => $type,
            'status' => 'in_progress',
        ]);

        $sortOrder = 0;

        foreach ($items as $key => $label) {
            EmployeeChecklistItem::query()->create([
                'employee_checklist_id' => $checklist->id,
                'key' => $key,
                'label' => $label,
                'is_done' => $key === 'create_account' && $type === 'onboard',
                'done_at' => $key === 'create_account' && $type === 'onboard' ? now() : null,
                'done_by' => $key === 'create_account' && $type === 'onboard' ? Auth::id() : null,
                'sort_order' => $sortOrder++,
            ]);
        }

        return $checklist->load('items');
    }

    /**
     * @param  array<int, string>  $keys
     */
    protected function markChecklistItemsDone(EmployeeChecklist $checklist, array $keys): void
    {
        $checklist->loadMissing('items');

        foreach ($checklist->items as $item) {
            if (! in_array($item->key, $keys, true) || $item->is_done) {
                continue;
            }

            $item->update([
                'is_done' => true,
                'done_at' => now(),
                'done_by' => Auth::id(),
            ]);
        }

        $this->syncChecklistStatus($checklist->fresh('items'));
    }

    protected function syncChecklistStatus(EmployeeChecklist $checklist): void
    {
        $allDone = $checklist->items->isNotEmpty()
            && $checklist->items->every(fn (EmployeeChecklistItem $item): bool => $item->is_done);

        $checklist->update([
            'status' => $allDone ? 'completed' : 'in_progress',
            'completed_at' => $allDone ? now() : null,
            'completed_by' => $allDone ? Auth::id() : null,
        ]);
    }

    protected function calculateLeavePayout(User $user, int $year): float
    {
        $user->loadMissing('rate');

        if (! $user->rate) {
            throw ValidationException::withMessages([
                'include_leave_payout' => ['User has no active rate for leave payout.'],
            ]);
        }

        $remainingDays = LeaveBalance::query()
            ->with('leavePolicy:id,is_paid')
            ->where('user_id', $user->id)
            ->where('year', $year)
            ->get()
            ->filter(fn (LeaveBalance $balance): bool => (bool) $balance->leavePolicy?->is_paid)
            ->sum(fn (LeaveBalance $balance): float => max(0, (float) $balance->remaining));

        return round($remainingDays * (float) $user->rate->daily_rate, 2);
    }
}
