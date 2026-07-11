<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Payroll\StorePayrollDeductionRequest;
use App\Http\Requests\Payroll\UpdatePayrollDeductionRequest;
use App\Models\PayrollDeduction;
use App\Services\Payroll\PayrollDeductionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PayrollDeductionController extends Controller
{
    public function __construct(
        private PayrollDeductionService $payrollDeductionService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $userId = $request->query('user_id') !== null ? (int) $request->query('user_id') : null;

        return response()->json([
            'data' => $this->payrollDeductionService->list($userId),
        ]);
    }

    public function store(StorePayrollDeductionRequest $request): JsonResponse
    {
        $deduction = $this->payrollDeductionService->create($request->validated());

        return response()->json([
            'message' => 'Deduction created successfully.',
            'data' => $deduction,
        ], 201);
    }

    public function update(UpdatePayrollDeductionRequest $request, PayrollDeduction $payrollDeduction): JsonResponse
    {
        $deduction = $this->payrollDeductionService->update($payrollDeduction, $request->validated());

        return response()->json([
            'message' => 'Deduction updated successfully.',
            'data' => $deduction,
        ]);
    }

    public function destroy(PayrollDeduction $payrollDeduction): JsonResponse
    {
        $this->payrollDeductionService->delete($payrollDeduction);

        return response()->json([
            'message' => 'Deduction deleted successfully.',
        ]);
    }
}
