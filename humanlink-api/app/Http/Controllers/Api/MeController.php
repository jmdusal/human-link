<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Contracts\UserDocumentServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\Me\UpdateMeRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class MeController extends Controller
{
    public function __construct(
        private UserDocumentServiceInterface $userDocumentService
    ) {}

    public function show(): JsonResponse
    {
        /** @var User $user */
        $user = Auth::user();

        return response()->json([
            'data' => $this->loadProfile($user),
        ]);
    }

    public function update(UpdateMeRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = Auth::user();
        $data = $request->validated();

        $user = DB::transaction(function () use ($user, $data): User {
            $payload = array_intersect_key($data, array_flip(['name', 'email', 'password']));

            if (array_key_exists('password', $payload) && blank($payload['password'])) {
                unset($payload['password']);
            }

            $user->update($payload);

            return $this->loadProfile($user->fresh());
        });

        return response()->json([
            'message' => 'Profile updated successfully.',
            'data' => $user,
        ]);
    }

    public function generateContract(): JsonResponse
    {
        /** @var User $user */
        $user = Auth::user();

        $document = $this->userDocumentService->generateContract($user);

        return response()->json([
            'message' => 'Contract generated successfully.',
            'data' => $document,
        ], 201);
    }

    public function generateId(): JsonResponse
    {
        /** @var User $user */
        $user = Auth::user();

        $document = $this->userDocumentService->generateIdCard($user);

        return response()->json([
            'message' => 'ID card generated successfully.',
            'data' => $document,
        ], 201);
    }

    private function loadProfile(User $user): User
    {
        return $user->load([
            'roles',
            'details',
            'rate',
            'schedule',
            'currentBalances.leavePolicy',
            'latestContract',
            'latestIdCard',
        ]);
    }
}
