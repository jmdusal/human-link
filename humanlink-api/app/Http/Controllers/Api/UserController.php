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

class UserController extends Controller
{
    public function index(): JsonResponse
    {
        $users = User::with(['roles', 'rate'])->latest()->get();

        return response()->json([
            'data' => $users
        ], 200);
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $data = $request->validated();

        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        $user = User::create($data);

        if ($request->has('monthly_rate')) {
            $user->rate()->create($request->only([
                'monthly_rate', 'daily_rate', 'hourly_rate',
                'allowance_monthly', 'effective_date', 'is_active'
            ]));
        }

        if ($request->has('role')) {
            $user->assignRole($request->role);
        } else {
            $user->assignRole('user');
        }

        $user->notify(new NewActivityNotification());

        return response()->json([
            'status' => 'success',
            'message' => 'User created successfully',
            'data' => $user->load(['roles', 'rate'])
            // 'data' => $user->load('roles')
        ], 201);
    }

    public function show(User $user): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => $user
        ], 200);
    }

    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        // $user->update($request->validated());
        $user->update($request->only(['name', 'email', 'status', 'password']));

        if ($request->hasAny(['monthly_rate', 'daily_rate', 'hourly_rate'])) {
            $user->rate()->updateOrCreate(
                ['user_id' => $user->id],
                $request->only([
                    'monthly_rate', 'daily_rate', 'hourly_rate',
                    'allowance_monthly', 'effective_date', 'is_active'
                ])
            );
        }

        if ($request->has('role')) {
            $user->syncRoles($request->role);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'User updated successfully',
            'data' => $user->load(['roles', 'rate'])
            // 'data' => $user->load('roles')
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
