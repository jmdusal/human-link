<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Contracts\AuthServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ConfirmTwoFactorRequest;
use App\Http\Requests\Auth\DisableTwoFactorRequest;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Requests\Auth\TwoFactorLoginRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthenticationController extends Controller
{
    public function __construct(
        private AuthServiceInterface $authService
    ) {}

    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->authService->login($request, $request->validated());

        if (! empty($result['requires_two_factor'])) {
            return response()->json([
                'message' => 'A verification code was sent to your email.',
                'requires_two_factor' => true,
                'login_token' => $result['login_token'],
                'email' => $result['email'] ?? null,
            ]);
        }

        return response()->json([
            'message' => 'Login successful',
            'user' => $result['user'],
        ]);
    }

    public function twoFactorLogin(TwoFactorLoginRequest $request): JsonResponse
    {
        $data = $request->validated();
        $user = $this->authService->completeTwoFactorLogin(
            $request,
            $data['login_token'],
            $data['code'],
        );

        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout($request);

        return response()->json(['message' => 'Logged out successfully']);
    }

    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $message = $this->authService->sendPasswordResetLink($request->validated('email'));

        return response()->json(['message' => $message]);
    }

    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $user = $this->authService->resetPassword($request->validated());

        return response()->json([
            'message' => 'Password has been reset. You can sign in now.',
            'data' => [
                'id' => $user->id,
                'email' => $user->email,
            ],
        ]);
    }

    public function sendVerificationEmail(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = Auth::user();
        $this->authService->sendEmailVerification($user);

        return response()->json(['message' => 'Verification link sent.']);
    }

    public function verifyEmail(Request $request, int $id, string $hash): JsonResponse
    {
        $user = $this->authService->verifyEmail($id, $hash);

        return response()->json([
            'message' => 'Email verified successfully.',
            'data' => [
                'id' => $user->id,
                'email' => $user->email,
                'email_verified_at' => $user->email_verified_at,
            ],
        ]);
    }

    public function enableTwoFactor(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = Auth::user();
        $setup = $this->authService->beginTwoFactorSetup($user);

        return response()->json([
            'message' => 'We sent a 6-digit code to your email. Enter it to enable two-factor authentication.',
            'data' => $setup,
        ]);
    }

    public function confirmTwoFactor(ConfirmTwoFactorRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = Auth::user();
        $user = $this->authService->confirmTwoFactorSetup($user, $request->validated('code'));

        return response()->json([
            'message' => 'Email two-factor authentication enabled.',
            'data' => $user,
        ]);
    }

    public function disableTwoFactor(DisableTwoFactorRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = Auth::user();
        $user = $this->authService->disableTwoFactor($user, $request->validated('password'));

        return response()->json([
            'message' => 'Two-factor authentication disabled.',
            'data' => $user,
        ]);
    }
}
