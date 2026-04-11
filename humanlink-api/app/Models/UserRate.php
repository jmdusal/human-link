<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
 * @property-read \App\Models\User $user
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
 * @mixin \Eloquent
 */
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
class UserRate extends Model
{
    protected $fillable = [
        'user_id',
        'monthly_rate',
        'daily_rate',
        'hourly_rate',
        'effective_date',
        'allowance_monthly',
        'effective_date',
        'is_active'
    ];

    protected $casts = [
        'monthly_rate' => 'decimal:2',
        'daily_rate' => 'decimal:2',
        'hourly_rate' => 'decimal:2',
        'allowance_monthly' => 'decimal:2',
        'effective_date' => 'date',
        'is_active' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
