<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Contracts\CompanyServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\Company\StoreCompanyRequest;
use App\Http\Requests\Company\SwitchCompanyRequest;
use App\Http\Requests\Company\UpdateCompanyRequest;
use App\Models\Company;
use Illuminate\Http\JsonResponse;

class CompanyController extends Controller
{
    public function __construct(
        private CompanyServiceInterface $companyService
    ) {}

    public function index(): JsonResponse
    {
        return response()->json([
            'data' => $this->companyService->list(),
        ]);
    }

    public function current(): JsonResponse
    {
        return response()->json([
            'data' => $this->companyService->current(),
        ]);
    }

    public function show(Company $company): JsonResponse
    {
        return response()->json([
            'data' => $this->companyService->find((int) $company->id),
        ]);
    }

    public function store(StoreCompanyRequest $request): JsonResponse
    {
        $company = $this->companyService->create($request->validated());

        return response()->json([
            'message' => 'Company created successfully.',
            'data' => $company,
        ], 201);
    }

    public function update(UpdateCompanyRequest $request, Company $company): JsonResponse
    {
        $company = $this->companyService->update(
            $this->companyService->find((int) $company->id),
            $request->validated()
        );

        return response()->json([
            'message' => 'Company updated successfully.',
            'data' => $company,
        ]);
    }

    public function updateCurrent(UpdateCompanyRequest $request): JsonResponse
    {
        $company = $this->companyService->update(
            $this->companyService->current(),
            $request->validated()
        );

        return response()->json([
            'message' => 'Company updated successfully.',
            'data' => $company,
        ]);
    }

    public function switchCompany(SwitchCompanyRequest $request): JsonResponse
    {
        $company = $this->companyService->switchTo((int) $request->validated('company_id'));

        return response()->json([
            'message' => 'Switched company context.',
            'data' => $company,
        ]);
    }
}
