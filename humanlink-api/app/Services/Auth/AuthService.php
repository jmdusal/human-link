<?php

declare(strict_types=1);

namespace App\Services\Auth;

use App\Contracts\AuthServiceInterface;
use App\Models\EmployeeChecklistItem;
use App\Models\User;
use App\Notifications\TwoFactorEmailCodeNotification;
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
    private const OTP_TTL_MINUTES = 10;

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
            Cache::put(
                $this->twoFactorLoginCacheKey($loginToken),
                $user->id,
                now()->addMinutes(self::OTP_TTL_MINUTES)
            );
            $this->sendEmailOtp($user, 'login', $loginToken);

            return [
                'requires_two_factor' => true,
                'login_token' => $loginToken,
                'email' => $this->maskEmail($user->email),
            ];
        }

        Auth::login($user, (bool) ($credentials['remember'] ?? false));
        $request->session()->regenerate();

        return ['user' => $user];
    }

    public function completeTwoFactorLogin(Request $request, string $loginToken, string $code): User
    {
        $userId = Cache::get($this->twoFactorLoginCacheKey($loginToken));

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

        if (! $this->consumeEmailOtp($code, 'login', $loginToken)) {
            throw ValidationException::withMessages([
                'code' => ['The authentication code is invalid or has expired.'],
            ]);
        }

        Cache::forget($this->twoFactorLoginCacheKey($loginToken));

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
        if (! $user->hasVerifiedEmail()) {
            throw ValidationException::withMessages([
                'email' => ['Verify your email before enabling two-factor authentication.'],
            ]);
        }

        if ($user->hasTwoFactorEnabled()) {
            throw ValidationException::withMessages([
                'code' => ['Two-factor authentication is already enabled.'],
            ]);
        }

        $this->sendEmailOtp($user, 'setup');

        return [
            'method' => 'email',
            'email' => $this->maskEmail($user->email),
            'expires_in' => self::OTP_TTL_MINUTES * 60,
        ];
    }

    public function confirmTwoFactorSetup(User $user, string $code): User
    {
        $user->refresh();

        if ($user->hasTwoFactorEnabled()) {
            throw ValidationException::withMessages([
                'code' => ['Two-factor authentication is already enabled.'],
            ]);
        }

        if (! $this->consumeEmailOtp($code, 'setup', null, $user->id)) {
            throw ValidationException::withMessages([
                'code' => ['The authentication code is invalid or has expired. Check your email and try again.'],
            ]);
        }

        $user->forceFill([
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
        ])->save();
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

    protected function sendEmailOtp(User $user, string $purpose, ?string $loginToken = null): void
    {
        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        Cache::put(
            $this->otpCacheKey($purpose, $loginToken, $user->id),
            Hash::make($code),
            now()->addMinutes(self::OTP_TTL_MINUTES)
        );

        $user->notify(new TwoFactorEmailCodeNotification($code, $purpose));
    }

    protected function consumeEmailOtp(
        string $code,
        string $purpose,
        ?string $loginToken = null,
        ?int $userId = null
    ): bool {
        $code = preg_replace('/\s+/', '', trim($code)) ?? '';

        if (! preg_match('/^\d{6}$/', $code)) {
            return false;
        }

        $key = $this->otpCacheKey($purpose, $loginToken, $userId);
        $hash = Cache::get($key);

        if (! is_string($hash) || ! Hash::check($code, $hash)) {
            return false;
        }

        Cache::forget($key);

        return true;
    }

    protected function otpCacheKey(string $purpose, ?string $loginToken = null, ?int $userId = null): string
    {
        if ($purpose === 'login') {
            return 'auth.two_factor.otp.login.'.($loginToken ?? '');
        }

        return 'auth.two_factor.otp.setup.'.($userId ?? 0);
    }

    protected function twoFactorLoginCacheKey(string $token): string
    {
        return 'auth.two_factor.login.'.$token;
    }

    protected function maskEmail(string $email): string
    {
        [$local, $domain] = array_pad(explode('@', $email, 2), 2, '');

        if ($local === '' || $domain === '') {
            return $email;
        }

        $visible = substr($local, 0, min(2, strlen($local)));

        return $visible.str_repeat('*', max(strlen($local) - strlen($visible), 1)).'@'.$domain;
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
