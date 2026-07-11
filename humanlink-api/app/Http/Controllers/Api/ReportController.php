<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Contracts\ReportServiceInterface;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    public function __construct(
        private ReportServiceInterface $reportService
    ) {}

    public function attendanceSummary(Request $request): StreamedResponse
    {
        $year = (int) $request->query('year', now()->year);
        $month = (int) $request->query('month', now()->month);
        $format = (string) $request->query('format', 'csv');

        return $this->reportService->attendanceSummary($year, $month, $format);
    }

    public function leaveUtilization(Request $request): StreamedResponse
    {
        $year = (int) $request->query('year', now()->year);
        $format = (string) $request->query('format', 'csv');

        return $this->reportService->leaveUtilization($year, $format);
    }

    public function payrollRegister(Request $request): StreamedResponse
    {
        $year = (int) $request->query('year', now()->year);
        $month = (int) $request->query('month', now()->month);
        $format = (string) $request->query('format', 'csv');

        return $this->reportService->payrollRegister($year, $month, $format);
    }
}
