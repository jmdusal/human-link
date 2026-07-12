<?php

declare(strict_types=1);

namespace App\Services\Payroll;

use App\Contracts\PayrollServiceInterface;
use App\Models\Attendance;
use App\Models\LeaveRequest;
use App\Models\PayrollDeduction;
use App\Models\Payslip;
use App\Models\PayslipAdjustment;
use App\Models\User;
use App\Notifications\PayslipReadyNotification;
use App\Support\CompanyContext;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;

class PayrollService implements PayrollServiceInterface
{
    private const STANDARD_WORK_DAYS = 22;

    public function __construct(
        private StatutoryContributionCalculator $statutoryCalculator,
        private CompanyContext $companyContext
    ) {}

    public function list(?int $year = null, ?int $month = null): array
    {
        $year ??= (int) now()->year;
        $month ??= (int) now()->month;

        $query = Payslip::query()
            ->with(['user:id,name,email', 'generator:id,name'])
            ->where('year', $year)
            ->where('month', $month);

        if (! $this->canManagePayroll()) {
            $query->where('user_id', Auth::id());
        } else {
            $this->companyContext->constrainByUserCompany($query);
        }

        $payslips = $query
            ->orderBy('user_id')
            ->get();

        return [
            'data' => $payslips,
            'meta' => [
                'year' => $year,
                'month' => $month,
            ],
        ];
    }

    public function show(Payslip $payslip): Payslip
    {
        $this->authorizePayslipAccess($payslip);

        $payslip->load([
            'user:id,name,email',
            'user.details',
            'generator:id,name',
            'adjustments.creator:id,name',
        ]);

        $payslip->setAttribute('attendance_breakdown', $this->attendanceBreakdown($payslip));

        return $payslip;
    }

    public function attendanceBreakdown(Payslip $payslip): Collection
    {
        return Attendance::query()
            ->where('user_id', $payslip->user_id)
            ->whereBetween('date', [
                $payslip->period_start->toDateString(),
                $payslip->period_end->toDateString(),
            ])
            ->orderBy('date')
            ->get();
    }

    public function generateForMonth(int $year, int $month): array
    {
        $this->assertValidPeriod($year, $month);

        $users = User::query()
            ->where('status', 'active')
            ->whereHas('rate')
            ->with('rate')
            ->orderBy('id');

        $this->companyContext->constrain($users);

        $users = $users->get();

        $generated = 0;
        $skipped = 0;
        $payslips = new Collection;

        DB::transaction(function () use ($users, $year, $month, &$generated, &$skipped, &$payslips): void {
            foreach ($users as $user) {
                $payslip = $this->buildPayslipForUser($user, $year, $month);

                if ($payslip === null) {
                    $skipped++;

                    continue;
                }

                $this->recalculateNetPay($payslip);
                $payslips->push($payslip);
                $generated++;
            }
        });

        $payslips->load(['user:id,name,email', 'generator:id,name']);

        foreach ($payslips as $payslip) {
            $payslip->user?->notify(new PayslipReadyNotification($payslip));
        }

        return [
            'data' => $payslips,
            'meta' => [
                'year' => $year,
                'month' => $month,
                'generated' => $generated,
                'skipped' => $skipped,
            ],
        ];
    }

    public function generateForUser(int $userId, int $year, int $month): Payslip
    {
        $this->assertValidPeriod($year, $month);

        $user = User::query()
            ->with('rate')
            ->findOrFail($userId);

        $actor = Auth::user();
        if ($actor && ! $actor->canAccessUserId((int) $user->id)) {
            abort(403, 'You are not allowed to generate payroll for this user.');
        }

        if (! $user->rate) {
            throw ValidationException::withMessages([
                'user_id' => ['User has no active rate. Set rates before generating a payslip.'],
            ]);
        }

        $payslip = DB::transaction(function () use ($user, $year, $month): ?Payslip {
            $payslip = $this->buildPayslipForUser($user, $year, $month);

            if ($payslip !== null) {
                $this->recalculateNetPay($payslip);
            }

            return $payslip;
        });

        if ($payslip === null) {
            throw ValidationException::withMessages([
                'user_id' => ['Unable to generate payslip for this user.'],
            ]);
        }

        $payslip = $payslip->load(['user:id,name,email', 'generator:id,name', 'adjustments.creator:id,name']);
        $user->notify(new PayslipReadyNotification($payslip));

        return $payslip;
    }

    public function generateThirteenthMonth(int $year): array
    {
        if ($year < 2020 || $year > 2100) {
            throw ValidationException::withMessages([
                'year' => ['Year is out of range.'],
            ]);
        }

        $users = User::query()
            ->where('status', 'active')
            ->whereHas('rate')
            ->with('rate')
            ->orderBy('id');

        $this->companyContext->constrain($users);

        $users = $users->get();

        $generated = 0;
        $skipped = 0;
        $payslips = new Collection;

        DB::transaction(function () use ($users, $year, &$generated, &$skipped, &$payslips): void {
            foreach ($users as $user) {
                $monthlyPayslips = Payslip::query()
                    ->where('user_id', $user->id)
                    ->where('year', $year)
                    ->whereBetween('month', [1, 12])
                    ->get();

                if ($monthlyPayslips->isEmpty()) {
                    $skipped++;

                    continue;
                }

                $totalBasic = (float) $monthlyPayslips->sum('basic_pay');
                $monthsCount = max(1, $monthlyPayslips->count());
                $thirteenth = round($totalBasic / 12, 2);

                $payslip = Payslip::query()->updateOrCreate(
                    [
                        'user_id' => $user->id,
                        'year' => $year,
                        'month' => 13,
                    ],
                    [
                        'period_start' => Carbon::create($year, 1, 1)->toDateString(),
                        'period_end' => Carbon::create($year, 12, 31)->toDateString(),
                        'days_worked' => 0,
                        'paid_leave_days' => 0,
                        'hours_worked' => 0,
                        'monthly_rate' => (float) ($user->rate->monthly_rate ?? 0),
                        'daily_rate' => (float) ($user->rate->daily_rate ?? 0),
                        'hourly_rate' => (float) ($user->rate->hourly_rate ?? 0),
                        'allowance_monthly' => 0,
                        'basic_pay' => 0,
                        'allowance_pay' => 0,
                        'overtime_pay' => 0,
                        'thirteenth_month_pay' => $thirteenth,
                        'gross_pay' => $thirteenth,
                        'sss_ee' => 0,
                        'sss_er' => 0,
                        'philhealth_ee' => 0,
                        'philhealth_er' => 0,
                        'pagibig_ee' => 0,
                        'pagibig_er' => 0,
                        'withholding_tax' => 0,
                        'other_deductions' => 0,
                        'total_deductions' => 0,
                        'net_pay' => $thirteenth,
                        'currency' => 'PHP',
                        'generated_by' => Auth::id(),
                        'generated_at' => now(),
                    ]
                );

                $payslips->push($payslip);
                $generated++;
            }
        });

        $payslips->load(['user:id,name,email', 'generator:id,name']);

        return [
            'data' => $payslips,
            'meta' => [
                'year' => $year,
                'month' => 13,
                'generated' => $generated,
                'skipped' => $skipped,
            ],
        ];
    }

    public function delete(Payslip $payslip): void
    {
        $this->authorizePayslipAccess($payslip);

        DB::transaction(fn () => $payslip->delete());
    }

    public function addAdjustment(Payslip $payslip, array $data): PayslipAdjustment
    {
        if (! $this->canManagePayroll()) {
            abort(403, 'You are not allowed to adjust payslips.');
        }

        return DB::transaction(function () use ($payslip, $data): PayslipAdjustment {
            $adjustment = PayslipAdjustment::query()->create([
                'payslip_id' => $payslip->id,
                'type' => $data['type'],
                'label' => $data['label'],
                'amount' => $data['amount'],
                'reason' => $data['reason'] ?? null,
                'created_by' => Auth::id(),
            ]);

            $this->recalculateNetPay($payslip);

            return $adjustment->load('creator:id,name');
        });
    }

    public function removeAdjustment(Payslip $payslip, PayslipAdjustment $adjustment): void
    {
        if (! $this->canManagePayroll()) {
            abort(403, 'You are not allowed to adjust payslips.');
        }

        if ((int) $adjustment->payslip_id !== (int) $payslip->id) {
            abort(404, 'Adjustment not found on this payslip.');
        }

        DB::transaction(function () use ($payslip, $adjustment): void {
            $adjustment->delete();
            $this->recalculateNetPay($payslip);
        });
    }

    public function downloadPdf(Payslip $payslip): Response
    {
        $payslip = $this->show($payslip);
        $payslip->loadMissing('user.company:id,name');

        $pdf = Pdf::loadView('payslips.pdf', [
            'payslip' => $payslip,
            'companyName' => $payslip->user?->company?->name,
        ]);

        $label = $payslip->isThirteenthMonth()
            ? sprintf('13th-month-%d', $payslip->year)
            : sprintf('%04d-%02d', $payslip->year, $payslip->month);

        return $pdf->download(sprintf('payslip-%s-%s.pdf', $payslip->user?->name ?? $payslip->user_id, $label));
    }

    protected function recalculateNetPay(Payslip $payslip): void
    {
        $payslip->loadMissing('adjustments');

        $adjEarnings = (float) $payslip->adjustments->where('type', 'earning')->sum('amount');
        $adjDeductions = (float) $payslip->adjustments->where('type', 'deduction')->sum('amount');

        $netPay = round(
            (float) $payslip->gross_pay
            - (float) $payslip->total_deductions
            + $adjEarnings
            - $adjDeductions,
            2
        );

        $payslip->update(['net_pay' => $netPay]);
    }

    protected function buildPayslipForUser(User $user, int $year, int $month): ?Payslip
    {
        $user->loadMissing('rate');

        if (! $user->rate) {
            return null;
        }

        $periodStart = Carbon::create($year, $month, 1)->startOfDay();
        $periodEnd = $periodStart->copy()->endOfMonth();

        $attendanceStats = Attendance::query()
            ->where('user_id', $user->id)
            ->whereBetween('date', [$periodStart->toDateString(), $periodEnd->toDateString()])
            ->selectRaw('COUNT(*) as days_worked, COALESCE(SUM(total_ms), 0) as total_ms, COALESCE(SUM(overtime_ms), 0) as overtime_ms')
            ->first();

        $attendanceDates = Attendance::query()
            ->where('user_id', $user->id)
            ->whereBetween('date', [$periodStart->toDateString(), $periodEnd->toDateString()])
            ->pluck('date')
            ->map(fn ($date) => Carbon::parse($date)->toDateString())
            ->all();

        $daysWorked = (int) ($attendanceStats->days_worked ?? 0);
        $hoursWorked = round(((int) ($attendanceStats->total_ms ?? 0)) / 3_600_000, 2);
        $overtimeHours = round(((int) ($attendanceStats->overtime_ms ?? 0)) / 3_600_000, 2);
        $paidLeaveDays = $this->calculatePaidLeaveDays($user, $periodStart, $periodEnd, $attendanceDates);
        $payableDays = $daysWorked + $paidLeaveDays;

        $dailyRate = (float) $user->rate->daily_rate;
        $monthlyRate = (float) $user->rate->monthly_rate;
        $hourlyRate = (float) $user->rate->hourly_rate;
        $allowanceMonthly = (float) $user->rate->allowance_monthly;

        $basicPay = round($payableDays * $dailyRate, 2);
        $allowancePay = round(
            $allowanceMonthly * (min($payableDays, self::STANDARD_WORK_DAYS) / self::STANDARD_WORK_DAYS),
            2
        );
        $overtimePay = round($overtimeHours * $hourlyRate, 2);
        $grossPay = round($basicPay + $allowancePay + $overtimePay, 2);

        $compensationBase = $monthlyRate > 0
            ? $monthlyRate
            : round($dailyRate * self::STANDARD_WORK_DAYS, 2);

        $statutory = $this->statutoryCalculator->calculate(
            $compensationBase,
            $grossPay,
            $periodEnd
        );

        $otherDeductions = $this->sumOtherDeductions($user->id, $year, $month);

        $totalDeductions = round(
            $statutory['sss_ee']
            + $statutory['philhealth_ee']
            + $statutory['pagibig_ee']
            + $statutory['withholding_tax']
            + $otherDeductions,
            2
        );

        $netPay = round($grossPay - $totalDeductions, 2);

        return Payslip::query()->updateOrCreate(
            [
                'user_id' => $user->id,
                'year' => $year,
                'month' => $month,
            ],
            [
                'period_start' => $periodStart->toDateString(),
                'period_end' => $periodEnd->toDateString(),
                'days_worked' => $daysWorked,
                'paid_leave_days' => $paidLeaveDays,
                'hours_worked' => $hoursWorked,
                'monthly_rate' => $monthlyRate,
                'daily_rate' => $dailyRate,
                'hourly_rate' => $hourlyRate,
                'allowance_monthly' => $allowanceMonthly,
                'basic_pay' => $basicPay,
                'allowance_pay' => $allowancePay,
                'overtime_pay' => $overtimePay,
                'thirteenth_month_pay' => 0,
                'gross_pay' => $grossPay,
                'sss_ee' => $statutory['sss_ee'],
                'sss_er' => $statutory['sss_er'],
                'philhealth_ee' => $statutory['philhealth_ee'],
                'philhealth_er' => $statutory['philhealth_er'],
                'pagibig_ee' => $statutory['pagibig_ee'],
                'pagibig_er' => $statutory['pagibig_er'],
                'withholding_tax' => $statutory['withholding_tax'],
                'other_deductions' => $otherDeductions,
                'total_deductions' => $totalDeductions,
                'net_pay' => $netPay,
                'currency' => 'PHP',
                'generated_by' => Auth::id(),
                'generated_at' => now(),
            ]
        );
    }

    protected function sumOtherDeductions(int $userId, int $year, int $month): float
    {
        $deductions = PayrollDeduction::query()
            ->where('user_id', $userId)
            ->where('is_active', true)
            ->get();

        $total = 0.0;

        foreach ($deductions as $deduction) {
            if ($deduction->appliesToPeriod($year, $month)) {
                $total += (float) $deduction->amount;
            }
        }

        return round($total, 2);
    }

    /**
     * @param  array<int, string>  $attendanceDates
     */
    protected function calculatePaidLeaveDays(
        User $user,
        Carbon $periodStart,
        Carbon $periodEnd,
        array $attendanceDates
    ): float {
        $leaveRequests = LeaveRequest::query()
            ->with('leavePolicy:id,is_paid')
            ->where('user_id', $user->id)
            ->where('status', 'approved')
            ->whereDate('start_date', '<=', $periodEnd->toDateString())
            ->whereDate('end_date', '>=', $periodStart->toDateString())
            ->get();

        $paidLeaveDays = 0.0;
        $countedDates = [];

        foreach ($leaveRequests as $leaveRequest) {
            if (! $leaveRequest->leavePolicy?->is_paid) {
                continue;
            }

            $cursor = $leaveRequest->start_date->copy()->startOfDay();
            $rangeEnd = $leaveRequest->end_date->copy()->startOfDay();

            if ($cursor->lt($periodStart)) {
                $cursor = $periodStart->copy()->startOfDay();
            }

            if ($rangeEnd->gt($periodEnd)) {
                $rangeEnd = $periodEnd->copy()->startOfDay();
            }

            while ($cursor->lte($rangeEnd)) {
                $dateKey = $cursor->toDateString();

                if (in_array($dateKey, $attendanceDates, true) || isset($countedDates[$dateKey])) {
                    $cursor->addDay();

                    continue;
                }

                $dayValue = 1.0;

                if (
                    $leaveRequest->half_day_type !== 'none'
                    && $leaveRequest->start_date->isSameDay($leaveRequest->end_date)
                    && $cursor->isSameDay($leaveRequest->start_date)
                ) {
                    $dayValue = 0.5;
                }

                $paidLeaveDays += $dayValue;
                $countedDates[$dateKey] = true;
                $cursor->addDay();
            }
        }

        return round($paidLeaveDays, 2);
    }

    protected function assertValidPeriod(int $year, int $month): void
    {
        if ($month < 1 || $month > 12) {
            throw ValidationException::withMessages([
                'month' => ['Month must be between 1 and 12.'],
            ]);
        }

        if ($year < 2020 || $year > 2100) {
            throw ValidationException::withMessages([
                'year' => ['Year is out of range.'],
            ]);
        }
    }

    protected function authorizePayslipAccess(Payslip $payslip): void
    {
        if ($this->canManagePayroll()) {
            return;
        }

        if ((int) $payslip->user_id !== (int) Auth::id()) {
            abort(403, 'You are not allowed to access this payslip.');
        }
    }

    protected function canManagePayroll(?User $user = null): bool
    {
        $user ??= Auth::user();

        if (! $user) {
            return false;
        }

        return $user->hasRole('super-admin') || $user->hasCompanyAccessScope();
    }
}
