<?php

declare(strict_types=1);

namespace App\Contracts;

use Symfony\Component\HttpFoundation\StreamedResponse;

interface ReportServiceInterface
{
    public function attendanceSummary(int $year, int $month, string $format = 'csv'): StreamedResponse;

    public function leaveUtilization(int $year, string $format = 'csv'): StreamedResponse;

    public function payrollRegister(int $year, int $month, string $format = 'csv'): StreamedResponse;
}
