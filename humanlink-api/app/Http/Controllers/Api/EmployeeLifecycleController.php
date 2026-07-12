<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Contracts\EmployeeLifecycleServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\OffboardUserRequest;
use App\Models\EmployeeChecklistItem;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class EmployeeLifecycleController extends Controller
{
    public function __construct(
        private EmployeeLifecycleServiceInterface $lifecycleService
    ) {}

    public function show(User $user): JsonResponse
    {
        return response()->json([
            'data' => $this->lifecycleService->getLifecycle($user),
        ]);
    }

    public function toggleItem(User $user, EmployeeChecklistItem $item): JsonResponse
    {
        $updated = $this->lifecycleService->toggleItem($user, $item);

        return response()->json([
            'message' => 'Checklist item updated.',
            'data' => $updated,
        ]);
    }

    public function offboard(OffboardUserRequest $request, User $user): JsonResponse
    {
        $result = $this->lifecycleService->offboard($user, $request->validated());

        return response()->json([
            'message' => 'Employee offboarded successfully.',
            'data' => $result,
        ]);
    }

    public function reonboard(User $user): JsonResponse
    {
        $result = $this->lifecycleService->reonboard($user);

        return response()->json([
            'message' => 'Employee re-onboarded successfully. Access restored. Re-assign workspaces if needed.',
            'data' => $result,
        ]);
    }
}
