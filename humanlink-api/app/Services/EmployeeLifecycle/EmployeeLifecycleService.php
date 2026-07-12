<?php

declare(strict_types=1);

namespace App\Services\EmployeeLifecycle;

use App\Contracts\EmployeeLifecycleServiceInterface;
use App\Contracts\PayrollServiceInterface;
use App\Models\EmployeeChecklist;
use App\Models\EmployeeChecklistItem;
use App\Models\LeaveBalance;
use App\Models\User;
use App\Models\UserDocument;
use App\Models\WorkspaceMember;
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
        'upload_contract' => 'Upload contract',
        'upload_id_scan' => 'Upload ID scan',
        'sign_policies' => 'Signed policies',
        'welcome_complete' => 'Welcome complete',
    ];

    public const OFFBOARD_ITEMS = [
        'resign_notice' => 'Resign notice',
        'access_revoke' => 'Revoke access',
        'archive_documents' => 'Archive / collect documents',
        'final_payslip' => 'Final payslip',
        'leave_payout' => 'Leave payout',
        'exit_interview' => 'Exit interview',
        'deactivate_account' => 'Deactivate account',
    ];

    /** Soft document steps — may be toggled without a file. */
    public const SOFT_DOCUMENT_KEYS = [
        'upload_contract',
        'upload_id_scan',
        'sign_policies',
        'archive_documents',
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

        if ($offboard) {
            $this->syncMissingItems($offboard, self::OFFBOARD_ITEMS);
            $offboard = $offboard->fresh('items');
        }

        return [
            'onboard' => $onboard->load('items'),
            'offboard' => $offboard,
            'documents' => $user->documents()->with('uploader:id,name')->get(),
            'soft_document_keys' => self::SOFT_DOCUMENT_KEYS,
        ];
    }

    public function ensureOnboardChecklist(User $user): EmployeeChecklist
    {
        $existing = EmployeeChecklist::query()
            ->with('items')
            ->where('user_id', $user->id)
            ->where('type', 'onboard')
            ->first();

        $checklist = $existing ?? $this->createChecklist($user, 'onboard', self::ONBOARD_ITEMS);

        $this->syncMissingItems($checklist, self::ONBOARD_ITEMS);
        $this->syncOnboardProgress($checklist->fresh('items'), $user);

        return $checklist->fresh('items');
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

    public function markOnboardItemDone(User $user, string $key): void
    {
        $checklist = $this->ensureOnboardChecklist($user);
        $this->markChecklistItemsDone($checklist, [$key]);
    }

    /**
     * Mark onboard steps that were already completed during user create / invite activation.
     */
    protected function syncOnboardProgress(EmployeeChecklist $checklist, User $user): void
    {
        $user->loadMissing(['roles', 'rate', 'schedule', 'leaveBalances', 'documents']);

        $doneKeys = ['create_account'];

        if ($user->roles->isNotEmpty()) {
            $doneKeys[] = 'assign_role';
        }

        if ($user->rate) {
            $doneKeys[] = 'set_rates';
        }

        if ($user->schedule) {
            $doneKeys[] = 'set_schedule';
        }

        if ($user->leaveBalances->isNotEmpty()) {
            $doneKeys[] = 'assign_leave_balances';
        }

        $hasWorkspaceAccess = WorkspaceMember::query()
            ->where('user_id', $user->id)
            ->where('status', WorkspaceMember::STATUS_ACCEPTED)
            ->exists();

        if ($hasWorkspaceAccess) {
            $doneKeys[] = 'workspace_access';
        }

        foreach (UserDocument::TYPE_CHECKLIST_KEYS as $docType => $checklistKey) {
            if ($user->documents->contains('type', $docType)) {
                $doneKeys[] = $checklistKey;
            }
        }

        // Invite flow leaves must_set_password true until they activate; then welcome is complete.
        if (! $user->must_set_password && $user->hasVerifiedEmail()) {
            $doneKeys[] = 'welcome_complete';
        }

        $this->markChecklistItemsDone($checklist, $doneKeys);
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
                'is_active' => false,
                'timer_status' => 'offline',
                'timer_started_at' => null,
                'timer_accumulated_ms' => 0,
            ]);

            if (method_exists($user, 'tokens')) {
                $user->tokens()->delete();
            }

            WorkspaceMember::query()->where('user_id', $user->id)->delete();

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
                'user' => $user->fresh(['roles', 'rate', 'schedule', 'details', 'leaveBalances', 'checklists', 'documents']),
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
            $this->syncMissingItems($existing, self::OFFBOARD_ITEMS);

            return $existing->fresh('items');
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
                'is_done' => false,
                'done_at' => null,
                'done_by' => null,
                'sort_order' => $sortOrder++,
            ]);
        }

        return $checklist->load('items');
    }

    /**
     * Add any newly defined checklist keys to an existing checklist.
     *
     * @param  array<string, string>  $items
     */
    protected function syncMissingItems(EmployeeChecklist $checklist, array $items): void
    {
        $checklist->loadMissing('items');
        $existingKeys = $checklist->items->pluck('key')->all();
        $sortOrder = (int) $checklist->items->max('sort_order');

        foreach ($items as $key => $label) {
            if (in_array($key, $existingKeys, true)) {
                continue;
            }

            EmployeeChecklistItem::query()->create([
                'employee_checklist_id' => $checklist->id,
                'key' => $key,
                'label' => $label,
                'is_done' => false,
                'done_at' => null,
                'done_by' => null,
                'sort_order' => ++$sortOrder,
            ]);
        }
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
