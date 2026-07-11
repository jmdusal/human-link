<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Contracts\ContractTemplateServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\ContractTemplate\PreviewContractTemplateRequest;
use App\Http\Requests\ContractTemplate\StoreContractTemplateRequest;
use App\Http\Requests\ContractTemplate\UpdateContractTemplateRequest;
use App\Models\ContractTemplate;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class ContractTemplateController extends Controller
{
    public function __construct(
        private ContractTemplateServiceInterface $contractTemplateService
    ) {}

    public function index(): JsonResponse
    {
        return response()->json([
            'data' => $this->contractTemplateService->list(),
        ]);
    }

    public function store(StoreContractTemplateRequest $request): JsonResponse
    {
        $template = $this->contractTemplateService->create($request->validated());

        return response()->json([
            'message' => 'Contract template created successfully.',
            'data' => $template,
        ], 201);
    }

    public function update(UpdateContractTemplateRequest $request, ContractTemplate $contractTemplate): JsonResponse
    {
        $template = $this->contractTemplateService->update($contractTemplate, $request->validated());

        return response()->json([
            'message' => 'Contract template updated successfully.',
            'data' => $template,
        ]);
    }

    public function destroy(ContractTemplate $contractTemplate): JsonResponse
    {
        $this->contractTemplateService->delete($contractTemplate);

        return response()->json([
            'message' => 'Contract template deleted successfully.',
        ]);
    }

    public function previewDraft(PreviewContractTemplateRequest $request): Response
    {
        return $this->contractTemplateService->previewPdf($request->validated('body'));
    }

    public function preview(ContractTemplate $contractTemplate): Response
    {
        return $this->contractTemplateService->previewPdf($contractTemplate->body);
    }
}
