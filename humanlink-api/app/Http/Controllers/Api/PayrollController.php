<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Contracts\PayrollServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\Payroll\GenerateIndividualPayrollRequest;
use App\Http\Requests\Payroll\GeneratePayrollRequest;
use App\Http\Requests\Payroll\GenerateThirteenthMonthRequest;
use App\Models\Payslip;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Symfony\Component\HttpFoundation\Response;

class PayrollController extends Controller
{
    public function __construct(
        private PayrollServiceInterface $payrollService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $result = $this->payrollService->list(
            $request->query('year') !== null ? (int) $request->query('year') : null,
            $request->query('month') !== null ? (int) $request->query('month') : null,
        );

        return response()->json($result);
    }

    public function show(Payslip $payslip): JsonResponse
    {
        return response()->json([
            'data' => $this->payrollService->show($payslip),
        ]);
    }

    public function pdf(Payslip $payslip): Response
    {
        return $this->payrollService->downloadPdf($payslip);
    }

    public function generate(GeneratePayrollRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $year = (int) $validated['year'];
        $month = (int) $validated['month'];
        $result = $this->payrollService->generateForMonth($year, $month);
        $monthName = Carbon::create($year, $month, 1)->format('F');

        return response()->json([
            'message' => sprintf(
                'Generated %d payslip(s) for %s %d.',
                $result['meta']['generated'],
                $monthName,
                $year,
            ),
            'data' => $result['data'],
            'meta' => $result['meta'],
        ], 201);
    }

    public function generateIndividual(GenerateIndividualPayrollRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $payslip = $this->payrollService->generateForUser(
            (int) $validated['user_id'],
            (int) $validated['year'],
            (int) $validated['month'],
        );

        return response()->json([
            'message' => 'Payslip generated successfully.',
            'data' => $payslip,
        ], 201);
    }

    public function generateThirteenthMonth(GenerateThirteenthMonthRequest $request): JsonResponse
    {
        $year = (int) $request->validated()['year'];
        $result = $this->payrollService->generateThirteenthMonth($year);

        return response()->json([
            'message' => sprintf('Generated %d 13th-month payslip(s) for %d.', $result['meta']['generated'], $year),
            'data' => $result['data'],
            'meta' => $result['meta'],
        ], 201);
    }

    public function destroy(Payslip $payslip): JsonResponse
    {
        $this->payrollService->delete($payslip);

        return response()->json([
            'message' => 'Payslip deleted successfully.',
        ]);
    }
}
