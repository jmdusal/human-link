<?php

declare(strict_types=1);

namespace App\Services\LeaveRequest;

use App\Contracts\LeaveRequestServiceInterface;
use App\Contracts\PayrollServiceInterface;
use App\Models\LeaveBalance;
use App\Models\LeavePolicy;
use App\Models\LeaveRequest;
use App\Models\Payslip;
use App\Models\User;
use App\Notifications\LeaveRequestStatusNotification;
use App\Notifications\LeaveRequestSubmittedNotification;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\ValidationException;

class LeaveRequestService implements LeaveRequestServiceInterface
{
    public function __construct(
        private PayrollServiceInterface $payrollService
    ) {}

    public function list(): Collection
    {
        $actor = Auth::user();
        $query = LeaveRequest::query()
            ->with([
                'user:id,name,email,user_type',
                'leavePolicy:id,name,slug,is_paid',
                'approver:id,name,email',
            ])
            ->latest();

        if ($this->canManageAllLeaves($actor) || $actor?->isManagerType()) {
            return $query->get();
        }

        return $query->where('user_id', $actor?->id)->get();
    }

    public function listPolicyOptions(): Collection
    {
        return LeavePolicy::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'is_paid', 'is_active']);
    }

    public function calendar(?string $start = null, ?string $end = null, ?string $status = null): array
    {
        $start ??= now()->startOfWeek()->toDateString();
        $end ??= now()->endOfWeek()->toDateString();

        $query = LeaveRequest::query()
            ->with([
                'user:id,name,email',
                'leavePolicy:id,name,slug',
            ])
            ->whereDate('start_date', '<=', $end)
            ->whereDate('end_date', '>=', $start)
            ->orderBy('start_date');

        if ($status) {
            $query->where('status', $status);
        } else {
            $query->whereIn('status', ['approved', 'pending']);
        }

        $actor = Auth::user();

        // Employees see company-wide approved leaves; managers/HR see approved + pending.
        if (! $this->canManageAllLeaves($actor) && ! $actor?->isManagerType()) {
            $query->where('status', 'approved');
        }

        return [
            'data' => $query->get(),
            'meta' => [
                'start' => $start,
                'end' => $end,
            ],
        ];
    }

    public function conflicts(LeaveRequest $leaveRequest): array
    {
        $this->authorizeView($leaveRequest);

        return $this->findOverlappingLeaves($leaveRequest)->map(function (LeaveRequest $conflict): array {
            return [
                'id' => $conflict->id,
                'user' => [
                    'id' => $conflict->user?->id,
                    'name' => $conflict->user?->name,
                ],
                'start_date' => $conflict->start_date?->toDateString(),
                'end_date' => $conflict->end_date?->toDateString(),
                'status' => $conflict->status,
                'policy' => $conflict->leavePolicy?->name,
            ];
        })->values()->all();
    }

    public function show(LeaveRequest $leaveRequest): LeaveRequest
    {
        $this->authorizeView($leaveRequest);

        return $leaveRequest->load([
            'user:id,name,email,user_type',
            'leavePolicy:id,name,slug,is_paid',
            'approver:id,name,email',
        ]);
    }

    public function create(array $data): LeaveRequest
    {
        $actor = Auth::user();

        if (! $actor) {
            abort(401);
        }

        $userId = (int) ($data['user_id'] ?? $actor->id);

        if ($userId !== (int) $actor->id && ! $this->canManageAllLeaves($actor)) {
            abort(403, 'You can only create leave requests for yourself.');
        }

        if (! $actor->isEmployeeType() && (int) $actor->id === $userId) {
            abort(403, 'Only employees can submit leave requests.');
        }

        $user = User::query()->findOrFail($userId);
        $policy = LeavePolicy::query()->findOrFail((int) $data['leave_policy_id']);

        if (! $policy->is_active) {
            throw ValidationException::withMessages([
                'leave_policy_id' => ['Selected leave policy is inactive.'],
            ]);
        }

        $startDate = Carbon::parse($data['start_date'])->startOfDay();
        $endDate = Carbon::parse($data['end_date'])->startOfDay();
        $halfDayType = $data['half_day_type'] ?? 'none';
        $totalDays = $this->calculateTotalDays($startDate, $endDate, $halfDayType);

        $this->assertSufficientBalance($user, $policy, $totalDays, (int) $startDate->year);

        $leaveRequest = DB::transaction(function () use ($data, $user, $policy, $startDate, $endDate, $halfDayType, $totalDays): LeaveRequest {
            $leaveRequest = LeaveRequest::query()->create([
                'user_id' => $user->id,
                'leave_policy_id' => $policy->id,
                'start_date' => $startDate->toDateString(),
                'end_date' => $endDate->toDateString(),
                'total_days' => $totalDays,
                'half_day_type' => $halfDayType,
                'reason' => $data['reason'] ?? null,
                'status' => 'pending',
            ]);

            return $leaveRequest->load([
                'user:id,name,email,user_type',
                'leavePolicy:id,name,slug,is_paid',
                'approver:id,name,email',
            ]);
        });

        $this->notifyApprovers($leaveRequest);

        return $leaveRequest;
    }

    public function update(LeaveRequest $leaveRequest, array $data): LeaveRequest
    {
        $this->authorizeOwnerOrAdmin($leaveRequest);

        if (! $leaveRequest->isPending()) {
            throw ValidationException::withMessages([
                'status' => ['Only pending leave requests can be updated.'],
            ]);
        }

        $policy = LeavePolicy::query()->findOrFail(
            (int) ($data['leave_policy_id'] ?? $leaveRequest->leave_policy_id)
        );

        $startDate = Carbon::parse($data['start_date'] ?? $leaveRequest->start_date)->startOfDay();
        $endDate = Carbon::parse($data['end_date'] ?? $leaveRequest->end_date)->startOfDay();
        $halfDayType = $data['half_day_type'] ?? $leaveRequest->half_day_type;
        $totalDays = $this->calculateTotalDays($startDate, $endDate, $halfDayType);

        $this->assertSufficientBalance(
            $leaveRequest->user,
            $policy,
            $totalDays,
            (int) $startDate->year
        );

        return DB::transaction(function () use ($leaveRequest, $data, $policy, $startDate, $endDate, $halfDayType, $totalDays): LeaveRequest {
            $leaveRequest->update([
                'leave_policy_id' => $policy->id,
                'start_date' => $startDate->toDateString(),
                'end_date' => $endDate->toDateString(),
                'total_days' => $totalDays,
                'half_day_type' => $halfDayType,
                'reason' => array_key_exists('reason', $data) ? $data['reason'] : $leaveRequest->reason,
            ]);

            return $leaveRequest->fresh([
                'user:id,name,email,user_type',
                'leavePolicy:id,name,slug,is_paid',
                'approver:id,name,email',
            ]);
        });
    }

    public function approve(LeaveRequest $leaveRequest, ?string $comment = null): LeaveRequest
    {
        $this->authorizeApproval($leaveRequest);

        if (! $leaveRequest->isPending()) {
            throw ValidationException::withMessages([
                'status' => ['Only pending leave requests can be approved.'],
            ]);
        }

        $leaveRequest->loadMissing(['user', 'leavePolicy']);

        $this->assertSufficientBalance(
            $leaveRequest->user,
            $leaveRequest->leavePolicy,
            (float) $leaveRequest->total_days,
            (int) $leaveRequest->start_date->year
        );

        $leaveRequest = DB::transaction(function () use ($leaveRequest, $comment): LeaveRequest {
            $leaveRequest->update([
                'status' => 'approved',
                'comment' => $comment,
                'approved_by' => Auth::id(),
                'approved_at' => now(),
            ]);

            $this->incrementLeaveBalanceUsed($leaveRequest);
            $this->regenerateAffectedPayslips($leaveRequest);

            return $leaveRequest->fresh([
                'user:id,name,email,user_type',
                'leavePolicy:id,name,slug,is_paid',
                'approver:id,name,email',
            ]);
        });

        $leaveRequest->user->notify(new LeaveRequestStatusNotification($leaveRequest));

        return $leaveRequest;
    }

    public function reject(LeaveRequest $leaveRequest, ?string $comment = null): LeaveRequest
    {
        $this->authorizeApproval($leaveRequest);

        if (! $leaveRequest->isPending()) {
            throw ValidationException::withMessages([
                'status' => ['Only pending leave requests can be rejected.'],
            ]);
        }

        $leaveRequest = DB::transaction(function () use ($leaveRequest, $comment): LeaveRequest {
            $leaveRequest->update([
                'status' => 'rejected',
                'comment' => $comment,
                'approved_by' => Auth::id(),
                'approved_at' => now(),
            ]);

            return $leaveRequest->fresh([
                'user:id,name,email,user_type',
                'leavePolicy:id,name,slug,is_paid',
                'approver:id,name,email',
            ]);
        });

        $leaveRequest->user->notify(new LeaveRequestStatusNotification($leaveRequest));

        return $leaveRequest;
    }

    public function cancel(LeaveRequest $leaveRequest): LeaveRequest
    {
        $this->authorizeOwnerOrAdmin($leaveRequest);

        if (! in_array($leaveRequest->status, ['pending', 'approved'], true)) {
            throw ValidationException::withMessages([
                'status' => ['Only pending or approved leave requests can be cancelled.'],
            ]);
        }

        $wasApproved = $leaveRequest->status === 'approved';

        $leaveRequest = DB::transaction(function () use ($leaveRequest, $wasApproved): LeaveRequest {
            $leaveRequest->update([
                'status' => 'cancelled',
                'approved_by' => Auth::id(),
                'approved_at' => now(),
            ]);

            if ($wasApproved) {
                $this->decrementLeaveBalanceUsed($leaveRequest);
                $this->regenerateAffectedPayslips($leaveRequest);
            }

            return $leaveRequest->fresh([
                'user:id,name,email,user_type',
                'leavePolicy:id,name,slug,is_paid',
                'approver:id,name,email',
            ]);
        });

        $leaveRequest->user->notify(new LeaveRequestStatusNotification($leaveRequest));

        return $leaveRequest;
    }

    public function delete(LeaveRequest $leaveRequest): void
    {
        $this->authorizeOwnerOrAdmin($leaveRequest);

        if ($leaveRequest->status === 'approved') {
            throw ValidationException::withMessages([
                'status' => ['Approved leave requests cannot be deleted. Cancel them instead.'],
            ]);
        }

        DB::transaction(fn () => $leaveRequest->delete());
    }

    protected function findOverlappingLeaves(LeaveRequest $leaveRequest): Collection
    {
        return LeaveRequest::query()
            ->with(['user:id,name', 'leavePolicy:id,name'])
            ->where('id', '!=', $leaveRequest->id)
            ->whereIn('status', ['approved', 'pending'])
            ->whereDate('start_date', '<=', $leaveRequest->end_date->toDateString())
            ->whereDate('end_date', '>=', $leaveRequest->start_date->toDateString())
            ->orderBy('start_date')
            ->get();
    }

    protected function notifyApprovers(LeaveRequest $leaveRequest): void
    {
        $recipients = User::query()
            ->where('id', '!=', $leaveRequest->user_id)
            ->where('status', 'active')
            ->where(function ($query): void {
                $query->where('user_type', 'manager')
                    ->orWhereHas('roles', function ($roles): void {
                        $roles->whereIn('name', ['super-admin', 'hr-manager']);
                    });
            })
            ->get();

        if ($recipients->isEmpty()) {
            return;
        }

        Notification::send($recipients, new LeaveRequestSubmittedNotification($leaveRequest));
    }

    protected function calculateTotalDays(Carbon $startDate, Carbon $endDate, string $halfDayType): float
    {
        if ($endDate->lt($startDate)) {
            throw ValidationException::withMessages([
                'end_date' => ['End date must be on or after the start date.'],
            ]);
        }

        $days = $startDate->diffInDays($endDate) + 1;

        if ($halfDayType !== 'none') {
            if ($days !== 1) {
                throw ValidationException::withMessages([
                    'half_day_type' => ['Half-day leave is only allowed for a single-day request.'],
                ]);
            }

            return 0.5;
        }

        return (float) $days;
    }

    protected function assertSufficientBalance(User $user, LeavePolicy $policy, float $totalDays, int $year): void
    {
        $balance = LeaveBalance::query()
            ->where('user_id', $user->id)
            ->where('leave_policy_id', $policy->id)
            ->where('year', $year)
            ->first();

        if (! $balance) {
            throw ValidationException::withMessages([
                'leave_policy_id' => ['No leave balance found for this policy and year.'],
            ]);
        }

        if (($balance->allowed - $balance->used) < $totalDays) {
            throw ValidationException::withMessages([
                'total_days' => ['Insufficient leave balance for this request.'],
            ]);
        }
    }

    protected function incrementLeaveBalanceUsed(LeaveRequest $leaveRequest): void
    {
        $balance = LeaveBalance::query()
            ->where('user_id', $leaveRequest->user_id)
            ->where('leave_policy_id', $leaveRequest->leave_policy_id)
            ->where('year', (int) $leaveRequest->start_date->year)
            ->lockForUpdate()
            ->first();

        if (! $balance) {
            throw ValidationException::withMessages([
                'leave_policy_id' => ['No leave balance found for this policy and year.'],
            ]);
        }

        $balance->used = round((float) $balance->used + (float) $leaveRequest->total_days, 2);
        $balance->save();
    }

    protected function decrementLeaveBalanceUsed(LeaveRequest $leaveRequest): void
    {
        $balance = LeaveBalance::query()
            ->where('user_id', $leaveRequest->user_id)
            ->where('leave_policy_id', $leaveRequest->leave_policy_id)
            ->where('year', (int) $leaveRequest->start_date->year)
            ->lockForUpdate()
            ->first();

        if (! $balance) {
            return;
        }

        $balance->used = max(0, round((float) $balance->used - (float) $leaveRequest->total_days, 2));
        $balance->save();
    }

    protected function regenerateAffectedPayslips(LeaveRequest $leaveRequest): void
    {
        $cursor = $leaveRequest->start_date->copy()->startOfMonth();
        $end = $leaveRequest->end_date->copy()->startOfMonth();

        while ($cursor->lte($end)) {
            $exists = Payslip::query()
                ->where('user_id', $leaveRequest->user_id)
                ->where('year', $cursor->year)
                ->where('month', $cursor->month)
                ->exists();

            if ($exists) {
                $this->payrollService->generateForUser(
                    (int) $leaveRequest->user_id,
                    (int) $cursor->year,
                    (int) $cursor->month
                );
            }

            $cursor->addMonth();
        }
    }

    protected function canManageAllLeaves(?User $user): bool
    {
        if (! $user) {
            return false;
        }

        return $user->hasRole('super-admin')
            || $user->hasRole('hr-manager')
            || $user->can('users-edit');
    }

    protected function authorizeView(LeaveRequest $leaveRequest): void
    {
        $actor = Auth::user();

        if ($this->canManageAllLeaves($actor) || $actor?->isManagerType()) {
            return;
        }

        if ((int) $leaveRequest->user_id === (int) $actor?->id) {
            return;
        }

        abort(403, 'You are not allowed to view this leave request.');
    }

    protected function authorizeOwnerOrAdmin(LeaveRequest $leaveRequest): void
    {
        $actor = Auth::user();

        if ($this->canManageAllLeaves($actor)) {
            return;
        }

        if ((int) $leaveRequest->user_id === (int) $actor?->id) {
            return;
        }

        abort(403, 'You are not allowed to modify this leave request.');
    }

    protected function authorizeApproval(LeaveRequest $leaveRequest): void
    {
        $actor = Auth::user();

        if ($this->canManageAllLeaves($actor)) {
            return;
        }

        if ($actor?->isManagerType()) {
            return;
        }

        abort(403, 'Only managers can approve or reject leave requests.');
    }
}
