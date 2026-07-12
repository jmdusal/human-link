<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Contracts\UserDocumentServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\UserDocument\GenerateContractRequest;
use App\Http\Requests\UserDocument\GenerateIdCardRequest;
use App\Http\Requests\UserDocument\StoreUserDocumentRequest;
use App\Models\User;
use App\Models\UserDocument;
use Illuminate\Http\JsonResponse;

class UserDocumentController extends Controller
{
    public function __construct(
        private UserDocumentServiceInterface $userDocumentService
    ) {}

    public function index(User $user): JsonResponse
    {
        return response()->json([
            'data' => $this->userDocumentService->list($user),
        ]);
    }

    public function store(StoreUserDocumentRequest $request, User $user): JsonResponse
    {
        $document = $this->userDocumentService->create(
            $user,
            $request->validated('type'),
            $request->file('file')
        );

        return response()->json([
            'message' => 'Document uploaded successfully',
            'data' => $document,
        ], 201);
    }

    public function generateContract(GenerateContractRequest $request, User $user): JsonResponse
    {
        $templateId = $request->validated('template_id');

        $document = $this->userDocumentService->generateContract(
            $user,
            $templateId !== null ? (int) $templateId : null
        );

        return response()->json([
            'message' => 'Contract generated successfully.',
            'data' => $document,
        ], 201);
    }

    public function generateId(GenerateIdCardRequest $request, User $user): JsonResponse
    {
        $templateId = $request->validated('template_id');

        $document = $this->userDocumentService->generateIdCard(
            $user,
            $templateId !== null ? (int) $templateId : null
        );

        return response()->json([
            'message' => 'ID card generated successfully.',
            'data' => $document,
        ], 201);
    }

    public function destroy(User $user, UserDocument $document): JsonResponse
    {
        if ((int) $document->user_id !== (int) $user->id) {
            abort(404, 'Document not found for this user.');
        }

        $this->userDocumentService->delete($document);

        return response()->json([
            'message' => 'Document deleted successfully',
        ]);
    }
}
