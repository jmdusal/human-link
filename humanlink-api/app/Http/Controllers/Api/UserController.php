<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Notifications\NewActivityNotification;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    public function index(): JsonResponse
    {
        $users = User::with(['roles', 'rate', 'schedule'])->latest()->get();

        return response()->json([
            'data' => $users
        ], 200);
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $user = DB::transaction(function () use ($request) {
            $user = User::create($request->validated());

            if ($request->filled('monthly_rate')) {
                $user->rate()->create($request->only([
                    'monthly_rate', 'daily_rate', 'hourly_rate',
                    'allowance_monthly', 'effective_date', 'is_active'
                ]));
            }

            $user->schedule()->create([
                'weekly_data' => $request->weekly_data,
                'start_date'  => $request->start_date ?? now()->format('Y-m-d'),
            ]);

            $user->assignRole($request->role ?? 'user');
            $user->notify(new NewActivityNotification());

            return $user;
        });

        return response()->json([
            'data' => $user->load(['roles', 'rate', 'schedule'])
        ], 201);
    }

    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $user = DB::transaction(function () use ($request, $user) {

            $user->update($request->validated());

            if ($request->has('role')) {
                $user->syncRoles($request->role);
            }

            if ($request->hasAny(['monthly_rate', 'daily_rate', 'hourly_rate'])) {
                $user->rate()->updateOrCreate(
                    ['user_id' => $user->id],
                    $request->only([
                        'monthly_rate', 'daily_rate', 'hourly_rate',
                        'allowance_monthly', 'effective_date', 'is_active'
                    ])
                );
            }

            if ($request->filled('weekly_data')) {
                $user->schedule()->updateOrCreate(
                    ['user_id' => $user->id],
                    [
                        'weekly_data' => $request->weekly_data,
                        'start_date'  => $request->start_date ?? now()->format('Y-m-d'),
                    ]
                );
            }

            return $user;

        });

        return response()->json([
            'message' => 'User updated successfully',
            'data' => $user->load(['roles', 'rate', 'schedule'])
        ], 200);
    }

    public function destroy(User $user): JsonResponse
    {
        // if (auth()->id() === $user->id) {
        //     return response()->json(['message' => 'Cannot delete yourself'], 403);
        // }

        $user->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'User deleted successfully'
        ], 200);
    }
}
