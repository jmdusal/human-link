<?php

declare(strict_types=1);

namespace App\Services\Auth;

use App\Contracts\AuthServiceInterface;
use App\Models\EmployeeChecklistItem;
use App\Models\User;
use App\Support\Totp;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class AuthService implements AuthServiceInterface
{
    public function login(Request $request, array $credentials): array
    {
        $user = User::query()->where('email', $credentials['email'])->first();

        if ($user && (! $user->is_active || $user->status === 'inactive')) {
            throw ValidationException::withMessages([
                'email' => ['Your account is deactivated. Please contact an administrator.'],
            ]);
        }

        if (! Auth::validate([
            'email' => $credentials['email'],
            'password' => $credentials['password'],
            'is_active' => true,
        ])) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials do not match our records.'],
            ]);
        }

        /** @var User $user */
        $user = User::query()->where('email', $credentials['email'])->firstOrFail();

        if ($user->must_set_password) {
            throw ValidationException::withMessages([
                'email' => ['Please set your password using the invite link sent to your email.'],
            ]);
        }

        if ($user->hasTwoFactorEnabled()) {
            $loginToken = Str::random(64);
            Cache::put($this->twoFactorCacheKey($loginToken), $user->id, now()->addMinutes(5));

            return [
                'requires_two_factor' => true,
                'login_token' => $loginToken,
            ];
        }

        Auth::login($user, (bool) ($credentials['remember'] ?? false));
        $request->session()->regenerate();

        return ['user' => $user];
    }

    public function completeTwoFactorLogin(Request $request, string $loginToken, string $code): User
    {
        $userId = Cache::pull($this->twoFactorCacheKey($loginToken));

        if (! $userId) {
            throw ValidationException::withMessages([
                'code' => ['This login challenge has expired. Please sign in again.'],
            ]);
        }

        /** @var User $user */
        $user = User::query()->findOrFail($userId);

        if (! $user->is_active || $user->status === 'inactive') {
            throw ValidationException::withMessages([
                'code' => ['Your account is deactivated. Please contact an administrator.'],
            ]);
        }

        if (! $this->verifyTwoFactorCode($user, $code)) {
            throw ValidationException::withMessages([
                'code' => ['The authentication code is invalid.'],
            ]);
        }

        Auth::login($user);
        $request->session()->regenerate();

        return $user;
    }

    public function logout(Request $request): void
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();
    }

    public function sendPasswordResetLink(string $email): string
    {
        $status = Password::broker()->sendResetLink(['email' => $email]);

        if ($status !== Password::RESET_LINK_SENT) {
            throw ValidationException::withMessages([
                'email' => [__($status)],
            ]);
        }

        return __($status);
    }

    public function resetPassword(array $data): User
    {
        $user = null;

        $status = Password::broker()->reset(
            [
                'email' => $data['email'],
                'password' => $data['password'],
                'password_confirmation' => $data['password_confirmation'],
                'token' => $data['token'],
            ],
            function (User $resetUser, string $password) use (&$user): void {
                $wasInvite = (bool) $resetUser->must_set_password;

                $resetUser->forceFill([
                    'password' => $password,
                    'must_set_password' => false,
                    'remember_token' => Str::random(60),
                ])->save();

                if (! $resetUser->hasVerifiedEmail()) {
                    $resetUser->markEmailAsVerified();
                    event(new Verified($resetUser));
                }

                if ($wasInvite) {
                    $this->markOnboardWelcomeComplete($resetUser);
                }

                event(new PasswordReset($resetUser));
                $user = $resetUser->fresh();
            }
        );

        if ($status !== Password::PASSWORD_RESET || ! $user) {
            throw ValidationException::withMessages([
                'email' => [__($status)],
            ]);
        }

        return $user;
    }

    public function sendEmailVerification(User $user): void
    {
        if ($user->hasVerifiedEmail()) {
            throw ValidationException::withMessages([
                'email' => ['Email is already verified.'],
            ]);
        }

        $user->sendEmailVerificationNotification();
    }

    public function verifyEmail(int $userId, string $hash): User
    {
        /** @var User $user */
        $user = User::query()->findOrFail($userId);

        if (! hash_equals($hash, sha1($user->getEmailForVerification()))) {
            throw new AccessDeniedHttpException('Invalid verification link.');
        }

        if (! $user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
            event(new Verified($user));
        }

        return $user->fresh();
    }

    public function beginTwoFactorSetup(User $user): array
    {
        $secret = Totp::generateSecret();
        $user->replaceTwoFactorSecret($secret);

        $recoveryCodes = collect(range(1, 8))
            ->map(fn (): string => Str::lower(Str::random(10)))
            ->values()
            ->all();

        $user->storeRecoveryCodes($recoveryCodes);

        return [
            'secret' => $secret,
            'qr_code_url' => Totp::otpAuthUrl($user->email, $secret, (string) config('app.name', 'HumanLink')),
            'recovery_codes' => $recoveryCodes,
        ];
    }

    public function confirmTwoFactorSetup(User $user, string $code): User
    {
        $secret = $user->getTwoFactorSecret();

        if (! $secret || $user->two_factor_confirmed_at) {
            throw ValidationException::withMessages([
                'code' => ['Two-factor setup is not pending confirmation.'],
            ]);
        }

        if (! Totp::verify($secret, $code)) {
            throw ValidationException::withMessages([
                'code' => ['The authentication code is invalid.'],
            ]);
        }

        $user->confirmTwoFactor();

        return $user->fresh();
    }

    public function disableTwoFactor(User $user, string $password): User
    {
        if (! Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'password' => ['The password is incorrect.'],
            ]);
        }

        $user->disableTwoFactor();

        return $user->fresh();
    }

    protected function verifyTwoFactorCode(User $user, string $code): bool
    {
        $secret = $user->getTwoFactorSecret();

        if ($secret && Totp::verify($secret, $code)) {
            return true;
        }

        $recoveryCodes = $user->recoveryCodes();
        $matchIndex = null;

        foreach ($recoveryCodes as $index => $recoveryCode) {
            if (hash_equals($recoveryCode, trim($code))) {
                $matchIndex = $index;
                break;
            }
        }

        if ($matchIndex === null) {
            return false;
        }

        unset($recoveryCodes[$matchIndex]);
        $user->storeRecoveryCodes(array_values($recoveryCodes));

        return true;
    }

    protected function twoFactorCacheKey(string $token): string
    {
        return 'auth.two_factor.login.'.$token;
    }

    protected function markOnboardWelcomeComplete(User $user): void
    {
        $item = EmployeeChecklistItem::query()
            ->where('key', 'welcome_complete')
            ->whereHas('checklist', function ($query) use ($user): void {
                $query->where('user_id', $user->id)->where('type', 'onboard');
            })
            ->first();

        if (! $item || $item->is_done) {
            return;
        }

        $item->update([
            'is_done' => true,
            'done_at' => now(),
            'done_by' => $user->id,
        ]);
    }
}
