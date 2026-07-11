<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Me\UpdateMeRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class MeController extends Controller
{
    public function show(): JsonResponse
    {
        /** @var User $user */
        $user = Auth::user();

        return response()->json([
            'data' => $user->load(['roles', 'rate', 'schedule', 'currentBalances.leavePolicy']),
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

            return $user->fresh()->load(['roles', 'rate', 'schedule', 'currentBalances.leavePolicy']);
        });

        return response()->json([
            'message' => 'Profile updated successfully.',
            'data' => $user,
        ]);
    }
}
