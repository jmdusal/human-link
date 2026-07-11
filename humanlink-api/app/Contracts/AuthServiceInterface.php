<?php

declare(strict_types=1);

namespace App\Contracts;

use App\Models\User;
use Illuminate\Http\Request;

interface AuthServiceInterface
{
    /**
     * @return array{user?: User, requires_two_factor?: bool, login_token?: string}
     */
    public function login(Request $request, array $credentials): array;

    public function completeTwoFactorLogin(Request $request, string $loginToken, string $code): User;

    public function logout(Request $request): void;

    public function sendPasswordResetLink(string $email): string;

    public function resetPassword(array $data): User;

    public function sendEmailVerification(User $user): void;

    public function verifyEmail(int $userId, string $hash): User;

    /**
     * @return array{secret: string, qr_code_url: string, recovery_codes: list<string>}
     */
    public function beginTwoFactorSetup(User $user): array;

    public function confirmTwoFactorSetup(User $user, string $code): User;

    public function disableTwoFactor(User $user, string $password): User;
}
