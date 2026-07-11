<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $user_id
 * @property string $name
 * @property numeric $amount
 * @property string $type
 * @property bool $is_active
 * @property int|null $start_month
 * @property int|null $start_year
 * @property int|null $end_month
 * @property int|null $end_year
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayrollDeduction newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayrollDeduction newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayrollDeduction query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayrollDeduction whereAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayrollDeduction whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayrollDeduction whereEndMonth($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayrollDeduction whereEndYear($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayrollDeduction whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayrollDeduction whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayrollDeduction whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayrollDeduction whereStartMonth($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayrollDeduction whereStartYear($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayrollDeduction whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayrollDeduction whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayrollDeduction whereUserId($value)
 * @mixin \Eloquent
 */
/**
 * @property int $id
 * @property int $user_id
 * @property string $name
 * @property numeric $amount
 * @property string $type
 * @property bool $is_active
 * @property int|null $start_month
 * @property int|null $start_year
 * @property int|null $end_month
 * @property int|null $end_year
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayrollDeduction newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayrollDeduction newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayrollDeduction query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayrollDeduction whereAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayrollDeduction whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayrollDeduction whereEndMonth($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayrollDeduction whereEndYear($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayrollDeduction whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayrollDeduction whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayrollDeduction whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayrollDeduction whereStartMonth($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayrollDeduction whereStartYear($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayrollDeduction whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayrollDeduction whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayrollDeduction whereUserId($value)
 * @mixin \Eloquent
 */
class PayrollDeduction extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'amount',
        'type',
        'is_active',
        'start_month',
        'start_year',
        'end_month',
        'end_year',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'is_active' => 'boolean',
            'start_month' => 'integer',
            'start_year' => 'integer',
            'end_month' => 'integer',
            'end_year' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function appliesToPeriod(int $year, int $month): bool
    {
        if (! $this->is_active) {
            return false;
        }

        $period = ($year * 100) + $month;

        if ($this->start_year !== null && $this->start_month !== null) {
            $start = ($this->start_year * 100) + $this->start_month;
            if ($period < $start) {
                return false;
            }
        }

        if ($this->end_year !== null && $this->end_month !== null) {
            $end = ($this->end_year * 100) + $this->end_month;
            if ($period > $end) {
                return false;
            }
        }

        return true;
    }
}
