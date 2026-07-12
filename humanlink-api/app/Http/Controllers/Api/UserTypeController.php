<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Contracts\UserTypeServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\UserType\StoreUserTypeRequest;
use App\Http\Requests\UserType\UpdateUserTypeRequest;
use App\Models\UserType;
use Illuminate\Http\JsonResponse;

class UserTypeController extends Controller
{
    public function __construct(
        private UserTypeServiceInterface $userTypeService
    ) {}

    public function index(): JsonResponse
    {
        return response()->json([
            'data' => $this->userTypeService->list(),
        ], 200);
    }

    public function store(StoreUserTypeRequest $request): JsonResponse
    {
        $userType = $this->userTypeService->create($request->validated());

        return response()->json([
            'message' => 'User type created successfully.',
            'data' => $userType,
        ], 201);
    }

    public function update(UpdateUserTypeRequest $request, UserType $userType): JsonResponse
    {
        $userType = $this->userTypeService->update($userType, $request->validated());

        return response()->json([
            'message' => 'User type updated successfully.',
            'data' => $userType,
        ], 200);
    }

    public function destroy(UserType $userType): JsonResponse
    {
        $this->userTypeService->delete($userType);

        return response()->json([
            'message' => 'User type deleted successfully.',
        ], 200);
    }
}
