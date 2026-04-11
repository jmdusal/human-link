<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
class LeaveRequest extends Model
{
    protected $fillable = [
        'user_id',
        'leave_policy_id',
        'start_date',
        'end_date',
        'total_days',
        'half_day_type',
        'reason',
        'status',
        'comment',
        'approved_by',
        'approved_at',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'total_days' => 'float',
        'approved_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function leavePolicy(): BelongsTo
    {
        return $this->belongsTo(LeavePolicy::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }
}
