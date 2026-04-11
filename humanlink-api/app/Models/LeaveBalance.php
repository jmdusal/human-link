<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
class LeaveBalance extends Model
{
    protected $fillable = [
        'user_id',
        'leave_policy_id',
        'allowed',
        'used',
        'year',
    ];

    protected function casts(): array
    {
        return [
            'allowed' => 'float',
            'used' => 'float',
            'year' => 'integer',
        ];
    }

    protected $appends = ['remaining'];

    protected function remaining(): Attribute
    {
        return Attribute::get(fn () => (float) ($this->allowed - $this->used));
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function leavePolicy(): BelongsTo
    {
        return $this->belongsTo(LeavePolicy::class);
    }
}
