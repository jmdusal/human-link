<?php

declare(strict_types=1);

namespace App\Contracts;

use App\Models\Payslip;
use App\Models\PayslipAdjustment;
use Illuminate\Database\Eloquent\Collection;
use Symfony\Component\HttpFoundation\Response;

interface PayrollServiceInterface
{
    /**
     * @return array{data: Collection<int, Payslip>, meta: array{year: int, month: int}}
     */
    public function list(?int $year = null, ?int $month = null): array;

    public function show(Payslip $payslip): Payslip;

    /**
     * @return Collection<int, \App\Models\Attendance>
     */
    public function attendanceBreakdown(Payslip $payslip): Collection;

    /**
     * @return array{data: Collection<int, Payslip>, meta: array{year: int, month: int, generated: int, skipped: int}}
     */
    public function generateForMonth(int $year, int $month): array;

    public function generateForUser(int $userId, int $year, int $month): Payslip;

    /**
     * @return array{data: Collection<int, Payslip>, meta: array{year: int, month: int, generated: int, skipped: int}}
     */
    public function generateThirteenthMonth(int $year): array;

    public function addAdjustment(Payslip $payslip, array $data): PayslipAdjustment;

    public function removeAdjustment(Payslip $payslip, PayslipAdjustment $adjustment): void;

    public function delete(Payslip $payslip): void;

    public function downloadPdf(Payslip $payslip): Response;
}
