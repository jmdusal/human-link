<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
class LeavePolicy extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'default_credits',
        'is_active',
        'is_paid',
        'is_cashable',
        'allow_carry_over',
        'max_carry_over',
        'requires_attachment'
    ];

    protected function casts(): array
    {
        return [
            'default_credits' => 'float',
            'max_carry_over' => 'float',
            'is_active' => 'boolean',
            'is_paid' => 'boolean',
            'is_cashable' => 'boolean',
            'allow_carry_over' => 'boolean',
            'requires_attachment' => 'boolean',
        ];
    }


    // protected $casts = [
    //     'default_credits' => 'decimal:2',
    //     'max_carry_over' => 'decimal:2',
    //     'is_active' => 'boolean',
    //     'is_paid' => 'boolean',
    //     'is_cashable' => 'boolean',
    //     'allow_carry_over' => 'boolean',
    //     'requires_attachment' => 'boolean',
    // ];

    public function leaveBalances(): HasMany
    {
        return $this->hasMany(LeaveBalance::class);
    }

    public function leaveRequests(): HasMany
    {
        return $this->hasMany(LeaveRequest::class);
    }
}
