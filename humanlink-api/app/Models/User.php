<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

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
 * @property string|null $sss_number
 * @property string|null $philhealth_number
 * @property string|null $pagibig_number
 * @property string|null $tin
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\PayrollDeduction> $payrollDeductions
 * @property-read int|null $payroll_deductions_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User wherePagibigNumber($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User wherePhilhealthNumber($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereSssNumber($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereTin($value)
 * @property \Illuminate\Support\Carbon|null $hired_at
 * @property \Illuminate\Support\Carbon|null $terminated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\EmployeeChecklist> $checklists
 * @property-read int|null $checklists_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereHiredAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereTerminatedAt($value)
 * @mixin \Eloquent
 */
class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasRoles, HasFactory, Notifiable, LogsActivity;

    protected $fillable = [
        'name',
        'email',
        'password',
        'status',
        'user_type',
        'sss_number',
        'philhealth_number',
        'pagibig_number',
        'tin',
        'hired_at',
        'terminated_at',
        'timer_started_at',
        'timer_accumulated_ms',
        'timer_status',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        // 'updated_at'
    ];

    protected function casts(): array
    {
        return [
            'timer_started_at' => 'datetime',
            'timer_accumulated_ms' => 'integer',
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'hired_at' => 'date:Y-m-d',
            'terminated_at' => 'date:Y-m-d',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'email'])
            ->logOnlyDirty();
            // ->dontSubmitEmptyLogs();
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

    public function isManagerType(): bool
    {
        return $this->user_type === 'manager';
    }

    public function isEmployeeType(): bool
    {
        return $this->user_type === 'employee';
    }

    public function isHrType(): bool
    {
        return $this->user_type === 'hr';
    }

    public function isElevatedStaff(): bool
    {
        return $this->hasRole('super-admin') || $this->isHrType();
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

        return \Illuminate\Support\Facades\DB::table('workspace_users')
            ->whereIn('workspace_id', $workspaceIds)
            ->pluck('user_id')
            ->map(fn ($id): int => (int) $id)
            ->unique()
            ->values()
            ->all();
    }

    public function canAccessUserId(int $userId): bool
    {
        if ($this->isElevatedStaff()) {
            return true;
        }

        if ((int) $this->id === $userId) {
            return true;
        }

        if ($this->isManagerType()) {
            return in_array($userId, $this->sharedWorkspaceMemberIds(), true);
        }

        return false;
    }

    /**
     * @return list<int>|null null means unrestricted (elevated staff)
     */
    public function reportableUserIds(): ?array
    {
        if ($this->isElevatedStaff()) {
            return null;
        }

        if ($this->isManagerType()) {
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

    public function workspaces(): BelongsToMany
    {
        return $this->belongsToMany(Workspace::class, 'workspace_users')
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
