<?php

declare(strict_types=1);

namespace App\Services\User;

use App\Contracts\UserServiceInterface;
use App\Contracts\EmployeeLifecycleServiceInterface;
use App\Contracts\UserDocumentServiceInterface;
use App\Enums\AccessScope;
use App\Models\Project;
use App\Models\User;
use App\Models\UserType;
use App\Models\Workspace;
use App\Notifications\NewActivityNotification;
use App\Notifications\ResetPasswordNotification;
use App\Services\User\Concerns\ManagesUserDetails;
use App\Services\User\Concerns\ManagesUserLeaveBalances;
use App\Services\User\Concerns\ManagesUserRates;
use App\Services\User\Concerns\ManagesUserSchedules;
use App\Support\CompanyContext;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class UserService implements UserServiceInterface
{
    use ManagesUserDetails;
    use ManagesUserLeaveBalances;
    use ManagesUserRates;
    use ManagesUserSchedules;

    public function __construct(
        private EmployeeLifecycleServiceInterface $lifecycleService,
        private UserDocumentServiceInterface $userDocumentService,
        private CompanyContext $companyContext
    ) {}

    public function list(): Collection
    {
        $query = User::query()
            ->with(['roles', 'details', 'rate', 'schedule', 'leaveBalances', 'checklists', 'documents', 'assignedUserType:id,name,slug,access_scope'])
            ->whereDoesntHave('roles', function ($query): void {
                $query->where('name', 'super-admin');
            });

        $this->companyContext->constrain($query);

        return $query->latest()->get();
    }

    public function create(array $data): User
    {
        return DB::transaction(function () use ($data): User {
            $sendInvite = array_key_exists('send_invite', $data)
                ? filter_var($data['send_invite'], FILTER_VALIDATE_BOOLEAN)
                : true;

            $payload = $this->userPayload($data);
            $payload['company_id'] = $this->companyContext->isPlatformAdmin() && isset($data['company_id'])
                ? (int) $data['company_id']
                : $this->companyContext->requireId();

            $this->applyUserTypeAssignment($payload, (int) $payload['company_id'], $data, defaultEmployee: true);

            if (empty($payload['hired_at'])) {
                $payload['hired_at'] = now()->toDateString();
            }

            if ($sendInvite) {
                // empty form passwords become null via ConvertEmptyStringsToNull.
                $payload['password'] = Str::password(32);
                $payload['must_set_password'] = true;
            } else {
                if (! filled($payload['password'] ?? null)) {
                    throw ValidationException::withMessages([
                        'password' => ['Password is required when invite email is not sent.'],
                    ]);
                }
                $payload['must_set_password'] = false;
            }

            unset($payload['email_verified_at']);

            $status = $payload['status'] ?? 'active';
            $payload['is_active'] = $status === 'active';

            $user = User::create($payload);

            if (! $sendInvite) {
                $user->forceFill(['email_verified_at' => now()])->save();
            }

            $this->assignActiveLeaveBalances($user);
            $this->createUserDetails($user, $data);
            $this->createUserRate($user, $data);
            $this->createUserSchedule($user, $data);

            $role = $data['role'] ?? 'user';
            $user->assignRole($role);
            $this->syncPermissionsForUserType($user, $role);

            $user->notify(new NewActivityNotification());
            $this->lifecycleService->ensureOnboardChecklist($user);
            $this->userDocumentService->syncContractForEmploymentType($user, force: true);

            if ($sendInvite) {
                $token = Password::broker()->createToken($user);
                // Strip eager-loaded relations so queue restore doesn't depend on them.
                $user->withoutRelations()->notify(new ResetPasswordNotification($token, isInvite: true));
            } elseif (! $user->hasVerifiedEmail()) {
                $user->sendEmailVerificationNotification();
            }

            return $user->load(['roles', 'details', 'rate', 'schedule', 'leaveBalances.leavePolicy', 'checklists', 'documents', 'assignedUserType:id,name,slug,access_scope']);
        });
    }

    public function update(User $user, array $data): User
    {
        return DB::transaction(function () use ($user, $data): User {
            $user->loadMissing('details');
            $previousEmploymentType = $user->details?->employment_type;

            $payload = $this->userPayload($data);
            $companyId = (int) ($user->company_id ?? $this->companyContext->requireId());
            if (array_key_exists('user_type_id', $data) || array_key_exists('user_type', $data)) {
                $this->applyUserTypeAssignment($payload, $companyId, $data);
            }

            if (array_key_exists('status', $payload)) {
                $payload['is_active'] = $payload['status'] === 'active';
                if ($payload['status'] === 'active') {
                    $payload['terminated_at'] = $payload['terminated_at'] ?? null;
                }
            }

            $user->update($payload);

            if (array_key_exists('role', $data)) {
                $user->syncRoles([$data['role']]);
            }

            $this->syncPermissionsForUserType(
                $user,
                $data['role'] ?? $user->getRoleNames()->first()
            );

            $this->syncUserDetails($user, $data);
            $this->syncUserRate($user, $data);
            $this->syncUserSchedule($user, $data);

            $this->lifecycleService->ensureOnboardChecklist($user);

            $user->unsetRelation('details');
            $user->load('details');
            $newEmploymentType = $user->details?->employment_type;

            if (filled($newEmploymentType)) {
                $employmentTypeChanged = $previousEmploymentType !== $newEmploymentType;
                $this->userDocumentService->syncContractForEmploymentType(
                    $user,
                    force: $employmentTypeChanged
                );
            }

            return $user->load(['roles', 'details', 'rate', 'schedule', 'leaveBalances', 'checklists', 'documents', 'assignedUserType:id,name,slug,access_scope']);
        });
    }

    public function delete(User $user): void
    {
        $user->delete();
    }

    public function resendInvite(User $user): User
    {
        $this->guardAccountIsActionable($user, 'invite');

        if (! $user->must_set_password && $user->hasVerifiedEmail()) {
            throw ValidationException::withMessages([
                'user' => ['This user has already completed invite setup. Use force password reset instead.'],
            ]);
        }

        $user->forceFill(['must_set_password' => true])->save();

        $token = Password::broker()->createToken($user);
        $user->withoutRelations()->notify(new ResetPasswordNotification($token, isInvite: true));

        $user->refresh();

        return $user->load(['roles', 'details', 'rate', 'schedule', 'leaveBalances', 'checklists', 'documents']);
    }

    public function forcePasswordReset(User $user): User
    {
        $this->guardAccountIsActionable($user, 'password reset');

        $user->forceFill(['must_set_password' => true])->save();

        $token = Password::broker()->createToken($user);
        $user->withoutRelations()->notify(new ResetPasswordNotification($token, isInvite: false));

        $user->refresh();

        return $user->load(['roles', 'details', 'rate', 'schedule', 'leaveBalances', 'checklists', 'documents']);
    }

    public function deactivate(User $user): User
    {
        if ($user->terminated_at !== null) {
            throw ValidationException::withMessages([
                'user' => ['This employee has been offboarded. Use lifecycle tools to manage exit status.'],
            ]);
        }

        if ($user->status === 'inactive') {
            throw ValidationException::withMessages([
                'user' => ['This user is already deactivated.'],
            ]);
        }

        $user->update([
            'status' => 'inactive',
            'is_active' => false,
            'timer_status' => 'offline',
            'timer_started_at' => null,
            'timer_accumulated_ms' => 0,
        ]);

        if (method_exists($user, 'tokens')) {
            $user->tokens()->delete();
        }

        $user->refresh();

        return $user->load(['roles', 'details', 'rate', 'schedule', 'leaveBalances', 'checklists', 'documents']);
    }

    public function activate(User $user): User
    {
        if ($user->terminated_at !== null) {
            throw ValidationException::withMessages([
                'user' => ['This employee was offboarded. Clear termination via edit before reactivating.'],
            ]);
        }

        if ($user->status === 'active') {
            throw ValidationException::withMessages([
                'user' => ['This user is already active.'],
            ]);
        }

        $user->update([
            'status' => 'active',
            'is_active' => true,
        ]);

        $user->refresh();

        return $user->load(['roles', 'details', 'rate', 'schedule', 'leaveBalances', 'checklists', 'documents']);
    }

    public function listByWorkspace(Workspace $workspace): Collection
    {
        return $workspace->members()->get();
    }

    public function listByProject(Project $project): Collection
    {
        return $project->projectMembers()->get();
    }

    public function listManagers(): Collection
    {
        $query = User::query()
            ->whereAccessScope(AccessScope::Workspace)
            ->where('status', 'active');

        $this->companyContext->constrain($query);

        return $query
            ->with('assignedUserType:id,name,slug,access_scope')
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'user_type', 'user_type_id']);
    }

    protected function userPayload(array $data): array
    {
        return array_intersect_key($data, array_flip([
            'company_id',
            'name',
            'email',
            'password',
            'must_set_password',
            'is_active',
            'status',
            'user_type',
            'user_type_id',
            'hired_at',
            'terminated_at',
        ]));
    }

    /**
     * Resolve user_type_id + denormalized user_type slug from request input.
     *
     * @param  array<string, mixed>  $payload
     * @param  array<string, mixed>  $data
     */
    protected function applyUserTypeAssignment(
        array &$payload,
        int $companyId,
        array $data,
        bool $defaultEmployee = false
    ): void {
        $typeId = $data['user_type_id'] ?? $payload['user_type_id'] ?? null;
        $slug = $data['user_type'] ?? $payload['user_type'] ?? null;

        if ($typeId === null && $slug === null) {
            if (! $defaultEmployee) {
                return;
            }

            $slug = 'employee';
        }

        $userType = UserType::query()
            ->where('company_id', $companyId)
            ->when(
                $typeId !== null,
                fn ($query) => $query->whereKey((int) $typeId),
                fn ($query) => $query->where('slug', (string) $slug),
            )
            ->first();

        if (! $userType) {
            throw ValidationException::withMessages([
                'user_type_id' => ['Selected user type is invalid for this company.'],
            ]);
        }

        $payload['user_type_id'] = $userType->id;
        $payload['user_type'] = $userType->slug;
    }

    protected function guardAccountIsActionable(User $user, string $action): void
    {
        if ($user->terminated_at !== null || $user->status === 'inactive') {
            throw ValidationException::withMessages([
                'user' => ["Cannot send {$action} to a deactivated or offboarded user."],
            ]);
        }
    }

    protected function syncPermissionsForUserType(User $user, ?string $role = null): void
    {
        $user->refresh();

        if ($user->hasRole('super-admin') || $role === 'super-admin') {
            $user->syncPermissions([]);

            return;
        }

        $user->loadMissing('assignedUserType.permissions:id,name');

        $permissionNames = $user->assignedUserType?->permissions
            ?->pluck('name')
            ->all() ?? [];

        $user->syncPermissions($permissionNames);
    }
}
