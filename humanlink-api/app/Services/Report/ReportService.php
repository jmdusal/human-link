<?php

declare(strict_types=1);

namespace App\Services\Report;

use App\Contracts\ReportServiceInterface;
use App\Models\Attendance;
use App\Models\LeaveBalance;
use App\Models\Payslip;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportService implements ReportServiceInterface
{
    public function attendanceSummary(int $year, int $month, string $format = 'csv'): StreamedResponse
    {
        $this->assertCanExport();
        $this->assertValidPeriod($year, $month);

        $periodStart = Carbon::create($year, $month, 1)->startOfDay();
        $periodEnd = $periodStart->copy()->endOfMonth();

        $users = User::query()
            ->where('status', 'active')
            ->when($this->scopedUserIds(), fn ($q, $ids) => $q->whereIn('id', $ids))
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        $rows = [];

        foreach ($users as $user) {
            $stats = Attendance::query()
                ->where('user_id', $user->id)
                ->whereBetween('date', [$periodStart->toDateString(), $periodEnd->toDateString()])
                ->selectRaw(
                    'COUNT(*) as days_worked,
                     COALESCE(SUM(total_ms), 0) as total_ms,
                     COALESCE(SUM(late_ms), 0) as late_ms,
                     COALESCE(SUM(undertime_ms), 0) as undertime_ms,
                     COALESCE(SUM(overtime_ms), 0) as overtime_ms'
                )
                ->first();

            $rows[] = [
                $user->name,
                $user->email,
                (int) ($stats->days_worked ?? 0),
                $this->msToHours((int) ($stats->total_ms ?? 0)),
                $this->msToHours((int) ($stats->late_ms ?? 0)),
                $this->msToHours((int) ($stats->undertime_ms ?? 0)),
                $this->msToHours((int) ($stats->overtime_ms ?? 0)),
            ];
        }

        return $this->streamExport(
            sprintf('attendance-summary-%04d-%02d', $year, $month),
            $format,
            ['Employee', 'Email', 'Days Worked', 'Hours', 'Late Hours', 'Undertime Hours', 'Overtime Hours'],
            $rows,
        );
    }

    public function leaveUtilization(int $year, string $format = 'csv'): StreamedResponse
    {
        $this->assertCanExport();

        if ($year < 2020 || $year > 2100) {
            throw ValidationException::withMessages([
                'year' => ['Year is out of range.'],
            ]);
        }

        $balances = LeaveBalance::query()
            ->with(['user:id,name,email'])
            ->where('year', $year)
            ->when($this->scopedUserIds(), fn ($q, $ids) => $q->whereIn('user_id', $ids))
            ->orderBy('user_id')
            ->get()
            ->groupBy('user_id');

        $rows = [];

        foreach ($balances as $userBalances) {
            $user = $userBalances->first()?->user;

            $entitled = (float) $userBalances->sum('allowed');
            $used = (float) $userBalances->sum('used');
            $remaining = round($entitled - $used, 2);

            $rows[] = [
                $user?->name ?? '',
                $user?->email ?? '',
                $entitled,
                $used,
                $remaining,
                $year,
            ];
        }

        return $this->streamExport(
            sprintf('leave-utilization-%d', $year),
            $format,
            ['Employee', 'Email', 'Entitled', 'Used', 'Remaining', 'Year'],
            $rows,
        );
    }

    public function payrollRegister(int $year, int $month, string $format = 'csv'): StreamedResponse
    {
        $this->assertCanExport();
        $this->assertValidPeriod($year, $month);

        $payslips = Payslip::query()
            ->with(['user:id,name,email', 'adjustments'])
            ->where('year', $year)
            ->where('month', $month)
            ->when($this->scopedUserIds(), fn ($q, $ids) => $q->whereIn('user_id', $ids))
            ->orderBy('user_id')
            ->get();

        $rows = [];

        foreach ($payslips as $payslip) {
            $adjEarnings = (float) $payslip->adjustments->where('type', 'earning')->sum('amount');
            $adjDeductions = (float) $payslip->adjustments->where('type', 'deduction')->sum('amount');

            $rows[] = [
                $payslip->user?->name ?? '',
                (int) $payslip->days_worked,
                (float) $payslip->paid_leave_days,
                (float) $payslip->hours_worked,
                (float) $payslip->basic_pay,
                (float) $payslip->allowance_pay,
                (float) $payslip->overtime_pay,
                (float) $payslip->gross_pay,
                (float) $payslip->sss_ee,
                (float) $payslip->philhealth_ee,
                (float) $payslip->pagibig_ee,
                (float) $payslip->withholding_tax,
                (float) $payslip->other_deductions,
                round($adjEarnings - $adjDeductions, 2),
                (float) $payslip->net_pay,
            ];
        }

        return $this->streamExport(
            sprintf('payroll-register-%04d-%02d', $year, $month),
            $format,
            [
                'Employee', 'Days', 'Paid Leave', 'Hours', 'Basic', 'Allowance', 'OT', 'Gross',
                'SSS', 'PhilHealth', 'Pag-IBIG', 'WHT', 'Other Ded', 'Adjustments', 'Net',
            ],
            $rows,
        );
    }

    /**
     * @param  array<int, string>  $headers
     * @param  array<int, array<int, mixed>>  $rows
     */
    protected function streamExport(string $basename, string $format, array $headers, array $rows): StreamedResponse
    {
        $isExcel = in_array($format, ['xlsx', 'xls'], true);
        $extension = $isExcel ? 'xls' : 'csv';
        $contentType = $isExcel
            ? 'application/vnd.ms-excel'
            : 'text/csv';

        return response()->streamDownload(function () use ($headers, $rows): void {
            $handle = fopen('php://output', 'w');

            if ($handle === false) {
                return;
            }

            fputcsv($handle, $headers);

            foreach ($rows as $row) {
                fputcsv($handle, $row);
            }

            fclose($handle);
        }, "{$basename}.{$extension}", [
            'Content-Type' => $contentType,
        ]);
    }

    protected function msToHours(int $ms): float
    {
        return round($ms / 3_600_000, 2);
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

    protected function assertCanExport(): void
    {
        $user = Auth::user();

        if (! $user) {
            abort(401);
        }

        if (
            $user->hasRole('super-admin')
            || $user->isHrType()
            || $user->can('reports-view')
        ) {
            return;
        }

        abort(403, 'You are not allowed to export reports.');
    }

    /**
     * @return list<int>|null
     */
    protected function scopedUserIds(): ?array
    {
        /** @var User|null $user */
        $user = Auth::user();

        return $user?->reportableUserIds();
    }
}
