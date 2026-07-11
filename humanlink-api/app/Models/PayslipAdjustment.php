<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $payslip_id
 * @property string $type
 * @property string $label
 * @property numeric $amount
 * @property string|null $reason
 * @property int|null $created_by
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User|null $creator
 * @property-read \App\Models\Payslip $payslip
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayslipAdjustment newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayslipAdjustment newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayslipAdjustment query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayslipAdjustment whereAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayslipAdjustment whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayslipAdjustment whereCreatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayslipAdjustment whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayslipAdjustment whereLabel($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayslipAdjustment wherePayslipId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayslipAdjustment whereReason($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayslipAdjustment whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayslipAdjustment whereUpdatedAt($value)
 * @mixin \Eloquent
 */
/**
 * @property int $id
 * @property int $payslip_id
 * @property string $type
 * @property string $label
 * @property numeric $amount
 * @property string|null $reason
 * @property int|null $created_by
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User|null $creator
 * @property-read \App\Models\Payslip $payslip
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayslipAdjustment newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayslipAdjustment newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayslipAdjustment query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayslipAdjustment whereAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayslipAdjustment whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayslipAdjustment whereCreatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayslipAdjustment whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayslipAdjustment whereLabel($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayslipAdjustment wherePayslipId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayslipAdjustment whereReason($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayslipAdjustment whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayslipAdjustment whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class PayslipAdjustment extends Model
{
    protected $fillable = [
        'payslip_id',
        'type',
        'label',
        'amount',
        'reason',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
        ];
    }

    public function payslip(): BelongsTo
    {
        return $this->belongsTo(Payslip::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function isEarning(): bool
    {
        return $this->type === 'earning';
    }

    public function isDeduction(): bool
    {
        return $this->type === 'deduction';
    }
}
