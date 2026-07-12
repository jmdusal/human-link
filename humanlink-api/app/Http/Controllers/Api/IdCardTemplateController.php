<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Contracts\IdCardTemplateServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\IdCardTemplate\PreviewIdCardTemplateRequest;
use App\Http\Requests\IdCardTemplate\StoreIdCardTemplateRequest;
use App\Http\Requests\IdCardTemplate\UpdateIdCardTemplateRequest;
use App\Models\IdCardTemplate;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class IdCardTemplateController extends Controller
{
    public function __construct(
        private IdCardTemplateServiceInterface $idCardTemplateService
    ) {}

    public function index(): JsonResponse
    {
        return response()->json([
            'data' => $this->idCardTemplateService->list(),
        ]);
    }

    public function store(StoreIdCardTemplateRequest $request): JsonResponse
    {
        $template = $this->idCardTemplateService->create($request->validated());

        return response()->json([
            'message' => 'ID card template created successfully.',
            'data' => $template,
        ], 201);
    }

    public function update(UpdateIdCardTemplateRequest $request, IdCardTemplate $idCardTemplate): JsonResponse
    {
        $template = $this->idCardTemplateService->update($idCardTemplate, $request->validated());

        return response()->json([
            'message' => 'ID card template updated successfully.',
            'data' => $template,
        ]);
    }

    public function destroy(IdCardTemplate $idCardTemplate): JsonResponse
    {
        $this->idCardTemplateService->delete($idCardTemplate);

        return response()->json([
            'message' => 'ID card template deleted successfully.',
        ]);
    }

    public function previewDraft(PreviewIdCardTemplateRequest $request): Response
    {
        return $this->idCardTemplateService->previewPdf($request->validated('body'));
    }

    public function preview(IdCardTemplate $idCardTemplate): Response
    {
        return $this->idCardTemplateService->previewPdf($idCardTemplate->body);
    }
}
