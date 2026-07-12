<?php

namespace App\Models;

use App\Enums\AccessScope;
use App\Models\Concerns\BelongsToCompany;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Crypt;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\Permission\Traits\HasRoles;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property \Illuminate\Support\Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $timer_started_at
 * @property int $timer_accumulated_ms
 * @property string $timer_status
 * @property string|null $remember_token
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection<int, \Illuminate\Notifications\DatabaseNotification> $notifications
 * @property-read int|null $notifications_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Permission\Models\Permission> $permissions
 * @property-read int|null $permissions_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Permission\Models\Role> $roles
 * @property-read int|null $roles_count
 * @method static \Database\Factories\UserFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User permission($permissions, bool $without = false)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User role($roles, ?string $guard = null, bool $without = false)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmailVerifiedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User wherePassword($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereRememberToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereTimerAccumulatedMs($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereTimerStartedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereTimerStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User withoutPermission($permissions)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User withoutRole($roles, ?string $guard = null)
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Activitylog\Models\Activity> $activities
 * @property-read int|null $activities_count
 * @property string $status
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereStatus($value)
 * @property-read \App\Models\UserRate|null $activeRate
 * @property-read \App\Models\UserRate|null $rate
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Schedule> $activeSchedules
 * @property-read int|null $active_schedules_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Schedule> $schedules
 * @property-read int|null $schedules_count
 * @property-read \App\Models\Schedule|null $schedule
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\LeaveBalance> $currentBalances
 * @property-read int|null $current_balances_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\LeaveBalance> $leaveBalances
 * @property-read int|null $leave_balances_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\LeaveRequest> $leaveRequests
 * @property-read int|null $leave_requests_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Activitylog\Models\Activity> $activitiesAsSubject
 * @property-read int|null $activities_as_subject_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Workspace> $workspaces
 * @property-read int|null $workspaces_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Workspace> $ownedWorkspaces
 * @property-read int|null $owned_workspaces_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Task> $assignedTasks
 * @property-read int|null $assigned_tasks_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Task> $createdTasks
 * @property-read int|null $created_tasks_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Project> $projects
 * @property-read int|null $projects_count
 * @property int $is_active
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereIsActive($value)
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\TaskComment> $taskComments
 * @property-read int|null $task_comments_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Attendance> $attendances
 * @property-read int|null $attendances_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Payslip> $payslips
 * @property-read int|null $payslips_count
 * @property string|null $user_type
 * @property int|null $manager_id
 * @property-read \Illuminate\Database\Eloquent\Collection<int, User> $employees
 * @property-read int|null $employees_count
 * @property-read User|null $manager
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereManagerId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereUserType($value)
 * @property-read \App\Models\UserDetail|null $details
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\PayrollDeduction> $payrollDeductions
 * @property-read int|null $payroll_deductions_count
 * @property \Illuminate\Support\Carbon|null $hired_at
 * @property \Illuminate\Support\Carbon|null $terminated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\EmployeeChecklist> $checklists
 * @property-read int|null $checklists_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereHiredAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereTerminatedAt($value)
 * @property bool $must_set_password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property \Illuminate\Support\Carbon|null $two_factor_confirmed_at
 * @property-read bool $has_two_factor_enabled
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereMustSetPassword($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereTwoFactorConfirmedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereTwoFactorRecoveryCodes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereTwoFactorSecret($value)
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\UserDocument> $documents
 * @property-read int|null $documents_count
 * @property-read string $hr_status
 * @property int $company_id
 * @property-read \App\Models\Company $company
 * @property-read \App\Models\UserDocument|null $latestContract
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User forCompany(int $companyId)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereCompanyId($value)
 * @property int|null $user_type_id
 * @property-read \App\Models\UserType|null $assignedUserType
 * @property-read string $access_scope
 * @method static Builder<static>|User whereAccessScope(\App\Enums\AccessScope|string $scope)
 * @method static Builder<static>|User whereUserTypeId($value)
 * @mixin \Eloquent
 */
class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use BelongsToCompany, HasRoles, HasFactory, Notifiable, LogsActivity;

    protected $fillable = [
        'company_id',
        'name',
        'email',
        'password',
        'must_set_password',
        'is_active',
        'email_verified_at',
        'status',
        'user_type',
        'user_type_id',
        'hired_at',
        'terminated_at',
        'timer_started_at',
        'timer_accumulated_ms',
        'timer_status',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'two_factor_confirmed_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
        'two_factor_recovery_codes',
    ];

    protected $appends = [
        'has_two_factor_enabled',
        'hr_status',
        'access_scope',
    ];

    protected function casts(): array
    {
        return [
            'timer_started_at' => 'datetime',
            'timer_accumulated_ms' => 'integer',
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'must_set_password' => 'boolean',
            'two_factor_confirmed_at' => 'datetime',
            'hired_at' => 'date:Y-m-d',
            'terminated_at' => 'date:Y-m-d',
        ];
    }

    public function getHasTwoFactorEnabledAttribute(): bool
    {
        return $this->hasTwoFactorEnabled();
    }

    /**
     * HR pipeline status for the users list: incomplete | ready | active | inactive | offboarding.
     *
     * Incomplete — missing rates, schedule, or leave balances
     * Ready — core setup done; finishing soft onboard / invite
     * Active — core setup done and account is live
     * Inactive — soft-deactivated (access revoked, not terminated)
     * Offboarding — terminated or offboard checklist in progress
     */
    public function getHrStatusAttribute(): string
    {
        $this->loadMissing(['checklists', 'rate', 'schedule', 'leaveBalances']);

        $offboard = $this->checklists->firstWhere('type', 'offboard');

        if ($offboard && $offboard->status === 'in_progress') {
            return 'offboarding';
        }

        if ($this->terminated_at !== null) {
            return 'offboarding';
        }

        if ($this->status === 'inactive') {
            return 'inactive';
        }

        $hasRates = (bool) $this->rate;
        $hasSchedule = (bool) $this->schedule;
        $hasLeave = $this->leaveBalances->isNotEmpty();

        if (! $hasRates || ! $hasSchedule || ! $hasLeave) {
            return 'incomplete';
        }

        // Soft document / welcome steps may still be open — still "ready" until account is fully live.
        if ($this->must_set_password || ! $this->hasVerifiedEmail()) {
            return 'ready';
        }

        return 'active';
    }

    public function hasTwoFactorEnabled(): bool
    {
        return filled($this->two_factor_secret) && $this->two_factor_confirmed_at !== null;
    }

    public function getTwoFactorSecret(): ?string
    {
        if (! $this->two_factor_secret) {
            return null;
        }

        return Crypt::decryptString($this->two_factor_secret);
    }

    /**
     * @return list<string>
     */
    public function recoveryCodes(): array
    {
        if (! $this->two_factor_recovery_codes) {
            return [];
        }

        /** @var list<string> $codes */
        $codes = json_decode(Crypt::decryptString($this->two_factor_recovery_codes), true) ?: [];

        return $codes;
    }

    /**
     * @param  list<string>  $codes
     */
    public function storeRecoveryCodes(array $codes): void
    {
        $this->forceFill([
            'two_factor_recovery_codes' => Crypt::encryptString(json_encode(array_values($codes))),
        ])->save();
    }

    public function replaceTwoFactorSecret(string $plainSecret): void
    {
        $this->forceFill([
            'two_factor_secret' => Crypt::encryptString($plainSecret),
            'two_factor_confirmed_at' => null,
        ])->save();
    }

    public function confirmTwoFactor(): void
    {
        $this->forceFill([
            'two_factor_confirmed_at' => now(),
        ])->save();
    }

    public function disableTwoFactor(): void
    {
        $this->forceFill([
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
        ])->save();
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'email'])
            ->logOnlyDirty();
    }

    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new \App\Notifications\ResetPasswordNotification(
            $token,
            (bool) $this->must_set_password,
        ));
    }

    public function sendEmailVerificationNotification(): void
    {
        $this->notify(new \App\Notifications\VerifyEmailNotification);
    }

    public function isPlatformAdmin(): bool
    {
        return $this->hasRole('super-admin');
    }

    public function details(): HasOne
    {
        return $this->hasOne(UserDetail::class);
    }

    public function rate(): HasOne
    {
        return $this->hasOne(UserRate::class)->where('is_active', true);
    }

    public function schedule(): HasOne
    {
        return $this->hasOne(Schedule::class)->whereNull('end_date');
    }

    public function leaveBalances(): HasMany
    {
        return $this->hasMany(LeaveBalance::class);
    }

    public function currentBalances(): HasMany
    {
        return $this->hasMany(LeaveBalance::class)->where('year', date('Y'));
    }

    public function leaveRequests(): HasMany
    {
        return $this->hasMany(LeaveRequest::class);
    }

    public function assignedUserType(): BelongsTo
    {
        return $this->belongsTo(UserType::class, 'user_type_id');
    }

    public function getAccessScopeAttribute(): string
    {
        $this->loadMissing('assignedUserType:id,access_scope');

        return $this->assignedUserType?->access_scope?->value
            ?? match ($this->user_type) {
                'hr' => AccessScope::Company->value,
                'manager' => AccessScope::Workspace->value,
                default => AccessScope::Self->value,
            };
    }

    public function accessScope(): AccessScope
    {
        return AccessScope::from($this->access_scope);
    }

    public function hasCompanyAccessScope(): bool
    {
        return $this->accessScope() === AccessScope::Company;
    }

    public function hasWorkspaceAccessScope(): bool
    {
        return $this->accessScope() === AccessScope::Workspace;
    }

    public function hasSelfAccessScope(): bool
    {
        return $this->accessScope() === AccessScope::Self;
    }

    public function isManagerType(): bool
    {
        return $this->hasWorkspaceAccessScope();
    }

    public function isEmployeeType(): bool
    {
        return $this->hasSelfAccessScope();
    }

    public function isHrType(): bool
    {
        return $this->hasCompanyAccessScope();
    }

    public function isElevatedStaff(): bool
    {
        return $this->hasRole('super-admin') || $this->hasCompanyAccessScope();
    }

    /**
     * Filter users whose assigned type uses the given data-access scope (single join, no N+1).
     */
    public function scopeWhereAccessScope(Builder $query, AccessScope|string $scope): Builder
    {
        $value = $scope instanceof AccessScope ? $scope->value : $scope;

        return $query->whereHas('assignedUserType', function (Builder $typeQuery) use ($value): void {
            $typeQuery->where('access_scope', $value);
        });
    }

    /**
     * User IDs that share at least one workspace with this user (includes self).
     *
     * @return list<int>
     */
    public function sharedWorkspaceMemberIds(): array
    {
        $workspaceIds = $this->workspaces()->pluck('workspaces.id');

        if ($workspaceIds->isEmpty()) {
            return [(int) $this->id];
        }

        $query = \Illuminate\Support\Facades\DB::table('workspace_members')
            ->join('users', 'users.id', '=', 'workspace_members.user_id')
            ->whereIn('workspace_members.workspace_id', $workspaceIds);

        if ($this->company_id !== null) {
            $query->where('users.company_id', $this->company_id);
        }

        return $query
            ->pluck('workspace_members.user_id')
            ->map(fn ($id): int => (int) $id)
            ->unique()
            ->values()
            ->all();
    }

    public function canAccessUserId(int $userId): bool
    {
        if ($this->isPlatformAdmin()) {
            if ($this->company_id === null) {
                return true;
            }

            return static::query()
                ->whereKey($userId)
                ->where('company_id', $this->company_id)
                ->exists();
        }

        if ((int) $this->id === $userId) {
            return true;
        }

        if ($this->hasCompanyAccessScope()) {
            return static::query()
                ->whereKey($userId)
                ->where('company_id', $this->company_id)
                ->exists();
        }

        if ($this->hasWorkspaceAccessScope()) {
            return in_array($userId, $this->sharedWorkspaceMemberIds(), true);
        }

        return false;
    }

    /**
     * @return list<int>|null null means unrestricted (platform super-admin with no active company)
     */
    public function reportableUserIds(): ?array
    {
        if ($this->isPlatformAdmin()) {
            if ($this->company_id === null) {
                return null;
            }

            return static::query()
                ->where('company_id', $this->company_id)
                ->pluck('id')
                ->map(fn ($id): int => (int) $id)
                ->all();
        }

        if ($this->hasCompanyAccessScope()) {
            return static::query()
                ->where('company_id', $this->company_id)
                ->pluck('id')
                ->map(fn ($id): int => (int) $id)
                ->all();
        }

        if ($this->hasWorkspaceAccessScope()) {
            return $this->sharedWorkspaceMemberIds();
        }

        return [(int) $this->id];
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }

    public function payslips(): HasMany
    {
        return $this->hasMany(Payslip::class);
    }

    public function payrollDeductions(): HasMany
    {
        return $this->hasMany(PayrollDeduction::class);
    }

    public function checklists(): HasMany
    {
        return $this->hasMany(EmployeeChecklist::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(UserDocument::class)->latest();
    }

    public function latestContract(): HasOne
    {
        return $this->hasOne(UserDocument::class)
            ->where('type', UserDocument::TYPE_CONTRACT)
            ->latestOfMany();
    }

    public function workspaces(): BelongsToMany
    {
        return $this->belongsToMany(Workspace::class, 'workspace_members')
            ->withPivot('role')
            ->withTimestamps();
    }

    public function ownedWorkspaces(): HasMany
    {
        return $this->hasMany(Workspace::class, 'owner_id');
    }

    public function createdTasks(): HasMany
    {
        return $this->hasMany(Task::class, 'creator_id');
    }

    public function assignedTasks(): BelongsToMany
    {
        return $this->belongsToMany(Task::class, 'task_assignments');
    }

    public function activities(): HasMany
    {
        return $this->hasMany(TaskActivity::class);
    }

    public function projects(): BelongsToMany
    {
        return $this->belongsToMany(Project::class, 'project_members')
                    ->withPivot('role')
                    ->withTimestamps();
    }

    public function hasProjectRole($projectId, $role): bool
    {
        return $this->projects()
                    ->where('project_id', $projectId)
                    ->wherePivot('role', $role)
                    ->exists();
    }

    public function taskComments(): HasMany
    {
        return $this->hasMany(TaskComment::class);
    }
}
