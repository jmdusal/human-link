<?php

// @formatter:off
// phpcs:ignoreFile
/**
 * A helper file for your Eloquent Models
 * Copy the phpDocs from this file to the correct Model,
 * And remove them from this file, to prevent double declarations.
 *
 * @author Barry vd. Heuvel <barryvdh@gmail.com>
 */


namespace App\Models{
/**
 * @property int $id
 * @property int $user_id
 * @property \Illuminate\Support\Carbon $date
 * @property \Illuminate\Support\Carbon|null $started_at
 * @property \Illuminate\Support\Carbon|null $ended_at
 * @property int $total_ms
 * @property string $status
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\AttendanceBreak> $breaks
 * @property-read int|null $breaks_count
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereEndedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereStartedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereTotalMs($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereUserId($value)
 */
	class Attendance extends \Eloquent {}
}

namespace App\Models{
/**
 * @property-read \App\Models\Attendance|null $attendance
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceBreak newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceBreak newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceBreak query()
 */
	class AttendanceBreak extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $leave_request_id
 * @property string $file_path
 * @property string $file_name
 * @property string $file_type
 * @property int $file_size
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveAttachment newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveAttachment newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveAttachment query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveAttachment whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveAttachment whereFileName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveAttachment whereFilePath($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveAttachment whereFileSize($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveAttachment whereFileType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveAttachment whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveAttachment whereLeaveRequestId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveAttachment whereUpdatedAt($value)
 * @mixin \Eloquent
 */
	class LeaveAttachment extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $user_id
 * @property int $leave_policy_id
 * @property numeric $allowed
 * @property numeric $used
 * @property string $year
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveBalance newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveBalance newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveBalance query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveBalance whereAllowed($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveBalance whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveBalance whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveBalance whereLeavePolicyId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveBalance whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveBalance whereUsed($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveBalance whereUserId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveBalance whereYear($value)
 * @property-read \App\Models\LeavePolicy $leavePolicy
 * @property-read mixed $remaining
 * @property-read \App\Models\User $user
 * @mixin \Eloquent
 */
	class LeaveBalance extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property numeric $default_credits
 * @property int $is_active
 * @property int $is_paid
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeavePolicy newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeavePolicy newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeavePolicy query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeavePolicy whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeavePolicy whereDefaultCredits($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeavePolicy whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeavePolicy whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeavePolicy whereIsPaid($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeavePolicy whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeavePolicy whereSlug($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeavePolicy whereUpdatedAt($value)
 * @property int $allow_carry_over
 * @property numeric $max_carry_over
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeavePolicy whereAllowCarryOver($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeavePolicy whereMaxCarryOver($value)
 * @property int $is_cashable
 * @property int $requires_attachment
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeavePolicy whereIsCashable($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeavePolicy whereRequiresAttachment($value)
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\LeaveBalance> $leaveBalances
 * @property-read int|null $leave_balances_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\LeaveRequest> $leaveRequests
 * @property-read int|null $leave_requests_count
 * @mixin \Eloquent
 */
	class LeavePolicy extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $user_id
 * @property int $leave_policy_id
 * @property string $start_date
 * @property string $end_date
 * @property numeric $total_days
 * @property string $half_day_type
 * @property string|null $reason
 * @property string $status
 * @property string|null $comment
 * @property int|null $approved_by
 * @property string|null $approved_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveRequest newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveRequest newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveRequest query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveRequest whereApprovedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveRequest whereApprovedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveRequest whereComment($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveRequest whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveRequest whereEndDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveRequest whereHalfDayType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveRequest whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveRequest whereLeavePolicyId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveRequest whereReason($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveRequest whereStartDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveRequest whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveRequest whereTotalDays($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveRequest whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveRequest whereUserId($value)
 * @property-read \App\Models\User|null $approver
 * @property-read \App\Models\LeavePolicy $leavePolicy
 * @property-read \App\Models\User $user
 * @mixin \Eloquent
 */
	class LeaveRequest extends \Eloquent {}
}

namespace App\Models{
/**
 * @property-read \App\Models\User|null $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayrollDeduction newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayrollDeduction newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayrollDeduction query()
 */
	class PayrollDeduction extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $user_id
 * @property int $year
 * @property int $month
 * @property \Illuminate\Support\Carbon $period_start
 * @property \Illuminate\Support\Carbon $period_end
 * @property int $days_worked
 * @property numeric $paid_leave_days
 * @property numeric $hours_worked
 * @property numeric $monthly_rate
 * @property numeric $daily_rate
 * @property numeric $hourly_rate
 * @property numeric $allowance_monthly
 * @property numeric $basic_pay
 * @property numeric $allowance_pay
 * @property numeric $gross_pay
 * @property string $currency
 * @property int|null $generated_by
 * @property \Illuminate\Support\Carbon|null $generated_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User|null $generator
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payslip newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payslip newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payslip query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payslip whereAllowanceMonthly($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payslip whereAllowancePay($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payslip whereBasicPay($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payslip whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payslip whereCurrency($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payslip whereDailyRate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payslip whereDaysWorked($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payslip whereGeneratedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payslip whereGeneratedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payslip whereGrossPay($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payslip whereHourlyRate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payslip whereHoursWorked($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payslip whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payslip whereMonth($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payslip whereMonthlyRate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payslip wherePaidLeaveDays($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payslip wherePeriodEnd($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payslip wherePeriodStart($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payslip whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payslip whereUserId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payslip whereYear($value)
 */
	class Payslip extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string $guard_name
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Activitylog\Models\Activity> $activities
 * @property-read int|null $activities_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, Permission> $permissions
 * @property-read int|null $permissions_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Role> $roles
 * @property-read int|null $roles_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\User> $users
 * @property-read int|null $users_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Permission newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Permission newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Permission permission($permissions, bool $without = false)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Permission query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Permission role($roles, ?string $guard = null, bool $without = false)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Permission whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Permission whereGuardName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Permission whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Permission whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Permission whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Permission withoutPermission($permissions)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Permission withoutRole($roles, ?string $guard = null)
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Activitylog\Models\Activity> $activitiesAsSubject
 * @property-read int|null $activities_as_subject_count
 * @mixin \Eloquent
 */
	class Permission extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $workspace_id
 * @property string $name
 * @property string|null $description
 * @property string|null $start_date
 * @property string|null $end_date
 * @property string $status
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Project newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Project newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Project query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Project whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Project whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Project whereEndDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Project whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Project whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Project whereStartDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Project whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Project whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Project whereWorkspaceId($value)
 * @property-read \App\Models\Workspace $workspace
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Task> $tasks
 * @property-read int|null $tasks_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\User> $projectMembers
 * @property-read int|null $project_members_count
 * @mixin \Eloquent
 */
	class Project extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $project_id
 * @property int $user_id
 * @property string $role
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProjectMember newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProjectMember newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProjectMember query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProjectMember whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProjectMember whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProjectMember whereProjectId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProjectMember whereRole($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProjectMember whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProjectMember whereUserId($value)
 * @property-read \App\Models\Project $project
 * @property-read \App\Models\User $user
 * @mixin \Eloquent
 */
	class ProjectMember extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string $guard_name
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Activitylog\Models\Activity> $activities
 * @property-read int|null $activities_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Permission> $permissions
 * @property-read int|null $permissions_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\User> $users
 * @property-read int|null $users_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Role newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Role newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Role permission($permissions, bool $without = false)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Role query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Role whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Role whereGuardName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Role whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Role whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Role whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Role withoutPermission($permissions)
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Activitylog\Models\Activity> $activitiesAsSubject
 * @property-read int|null $activities_as_subject_count
 * @mixin \Eloquent
 */
	class Role extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $user_id
 * @property string $date
 * @property string $shift_start
 * @property string $shift_end
 * @property int $break_minutes
 * @property int $is_rest_day
 * @property int $is_night_shift
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereBreakMinutes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereIsNightShift($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereIsRestDay($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereShiftEnd($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereShiftStart($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereUserId($value)
 * @property-read \App\Models\User|null $user
 * @property int|null $day_of_week
 * @property bool $is_active
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereDayOfWeek($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereIsActive($value)
 * @property \Illuminate\Support\Carbon $start_date
 * @property \Illuminate\Support\Carbon|null $end_date
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereEndDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereStartDate($value)
 * @property string|null $weekly_data
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereWeeklyData($value)
 * @mixin \Eloquent
 */
	class Schedule extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $workspace_id
 * @property string $name
 * @property string $color_hex
 * @property int $position
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Status newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Status newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Status query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Status whereColorHex($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Status whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Status whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Status whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Status wherePosition($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Status whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Status whereWorkspaceId($value)
 * @property-read \App\Models\Workspace $workspace
 * @mixin \Eloquent
 */
	class Status extends \Eloquent {}
}

namespace App\Models{
/**
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StatutoryContributionBracket newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StatutoryContributionBracket newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StatutoryContributionBracket query()
 */
	class StatutoryContributionBracket extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $workspace_id
 * @property string $name
 * @property string|null $color
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tag newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tag newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tag query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tag whereColor($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tag whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tag whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tag whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tag whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tag whereWorkspaceId($value)
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Task> $tasks
 * @property-read int|null $tasks_count
 * @property-read \App\Models\Workspace $workspace
 * @mixin \Eloquent
 */
	class Tag extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $project_id
 * @property int $status_id
 * @property int|null $parent_id
 * @property int $creator_id
 * @property string $title
 * @property string|null $description
 * @property string $priority
 * @property float $position
 * @property string|null $due_date
 * @property int|null $estimate_minutes
 * @property string|null $deleted_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task whereCreatorId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task whereDueDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task whereEstimateMinutes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task whereParentId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task wherePosition($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task wherePriority($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task whereProjectId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task whereStatusId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task whereTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task whereUpdatedAt($value)
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\TaskActivity> $activities
 * @property-read int|null $activities_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\User> $assignees
 * @property-read int|null $assignees_count
 * @property-read \App\Models\User $creator
 * @property-read Task|null $parent
 * @property-read \App\Models\Project $project
 * @property-read \App\Models\TaskStatus $status
 * @property-read \Illuminate\Database\Eloquent\Collection<int, Task> $subtasks
 * @property-read int|null $subtasks_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task withTrashed(bool $withTrashed = true)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task withoutTrashed()
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Tag> $tags
 * @property-read int|null $tags_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\TaskAttachment> $attachments
 * @property-read int|null $attachments_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\TaskComment> $comments
 * @property-read int|null $comments_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\TaskComment> $replies
 * @property-read int|null $replies_count
 * @property-read \App\Models\User|null $user
 * @mixin \Eloquent
 */
	class Task extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $task_id
 * @property int $user_id
 * @property string $type
 * @property string|null $old_value
 * @property string|null $new_value
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskActivity newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskActivity newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskActivity query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskActivity whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskActivity whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskActivity whereNewValue($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskActivity whereOldValue($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskActivity whereTaskId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskActivity whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskActivity whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskActivity whereUserId($value)
 * @property-read \App\Models\Task|null $task
 * @property-read \App\Models\User $user
 * @mixin \Eloquent
 */
	class TaskActivity extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $task_id
 * @property int $user_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskAssignment newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskAssignment newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskAssignment query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskAssignment whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskAssignment whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskAssignment whereTaskId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskAssignment whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskAssignment whereUserId($value)
 * @property-read \App\Models\Task|null $task
 * @property-read \App\Models\User $user
 * @mixin \Eloquent
 */
	class TaskAssignment extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $task_id
 * @property int $user_id
 * @property string $file_path
 * @property string $file_name
 * @property string $file_type
 * @property int $file_size
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Task|null $task
 * @property-read string $url
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskAttachment newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskAttachment newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskAttachment query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskAttachment whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskAttachment whereFileName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskAttachment whereFilePath($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskAttachment whereFileSize($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskAttachment whereFileType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskAttachment whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskAttachment whereTaskId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskAttachment whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskAttachment whereUserId($value)
 * @mixin \Eloquent
 */
	class TaskAttachment extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $task_id
 * @property int $user_id
 * @property int|null $parent_id
 * @property string $content
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskComment newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskComment newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskComment query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskComment whereContent($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskComment whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskComment whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskComment whereParentId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskComment whereTaskId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskComment whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskComment whereUserId($value)
 * @property-read TaskComment|null $parent
 * @property-read \Illuminate\Database\Eloquent\Collection<int, TaskComment> $replies
 * @property-read int|null $replies_count
 * @property-read \App\Models\User $user
 * @mixin \Eloquent
 */
	class TaskComment extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $workspace_id
 * @property string $name
 * @property string $color_hex
 * @property int $position
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskStatus newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskStatus newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskStatus query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskStatus whereColorHex($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskStatus whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskStatus whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskStatus whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskStatus wherePosition($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskStatus whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskStatus whereWorkspaceId($value)
 * @property-read \App\Models\Workspace $workspace
 * @mixin \Eloquent
 */
	class TaskStatus extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $task_id
 * @property int $tag_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskTag newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskTag newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskTag query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskTag whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskTag whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskTag whereTagId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskTag whereTaskId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskTag whereUpdatedAt($value)
 * @mixin \Eloquent
 */
	class TaskTag extends \Eloquent {}
}

namespace App\Models{
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
 * @mixin \Eloquent
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\PayrollDeduction> $payrollDeductions
 * @property-read int|null $payroll_deductions_count
 */
	class User extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $user_id
 * @property numeric $monthly_rate
 * @property numeric $daily_rate
 * @property numeric $hourly_rate
 * @property numeric $allowance_monthly
 * @property \Illuminate\Support\Carbon $effective_date
 * @property bool $is_active
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserRate newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserRate newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserRate query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserRate whereAllowanceMonthly($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserRate whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserRate whereDailyRate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserRate whereEffectiveDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserRate whereHourlyRate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserRate whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserRate whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserRate whereMonthlyRate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserRate whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserRate whereUserId($value)
 * @property-read \App\Models\User $user
 * @mixin \Eloquent
 */
	class UserRate extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property int $owner_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Workspace newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Workspace newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Workspace query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Workspace whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Workspace whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Workspace whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Workspace whereOwnerId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Workspace whereSlug($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Workspace whereUpdatedAt($value)
 * @property-read \App\Models\User $owner
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\TaskStatus> $taskStatuses
 * @property-read int|null $task_statuses_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Project> $projects
 * @property-read int|null $projects_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\User> $members
 * @property-read int|null $members_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Status> $statuses
 * @property-read int|null $statuses_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Tag> $tags
 * @property-read int|null $tags_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\User> $acceptedMembers
 * @property-read int|null $accepted_members_count
 * @mixin \Eloquent
 */
	class Workspace extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $workspace_id
 * @property int $user_id
 * @property string $role
 * @property string $status
 * @property string|null $invitation_token
 * @property \Illuminate\Support\Carbon|null $invited_at
 * @property \Illuminate\Support\Carbon|null $accepted_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User $user
 * @property-read \App\Models\Workspace $workspace
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkspaceUser newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkspaceUser newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkspaceUser query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkspaceUser whereAcceptedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkspaceUser whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkspaceUser whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkspaceUser whereInvitationToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkspaceUser whereInvitedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkspaceUser whereRole($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkspaceUser whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkspaceUser whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkspaceUser whereUserId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkspaceUser whereWorkspaceId($value)
 * @mixin \Eloquent
 */
	class WorkspaceUser extends \Eloquent {}
}

