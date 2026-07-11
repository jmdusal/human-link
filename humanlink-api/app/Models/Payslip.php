<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
 * @property numeric $overtime_pay
 * @property numeric $thirteenth_month_pay
 * @property numeric $gross_pay
 * @property numeric $sss_ee
 * @property numeric $sss_er
 * @property numeric $philhealth_ee
 * @property numeric $philhealth_er
 * @property numeric $pagibig_ee
 * @property numeric $pagibig_er
 * @property numeric $withholding_tax
 * @property numeric $other_deductions
 * @property numeric $total_deductions
 * @property numeric $net_pay
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
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payslip whereNetPay($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payslip whereOtherDeductions($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payslip whereOvertimePay($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payslip wherePagibigEe($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payslip wherePagibigEr($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payslip wherePaidLeaveDays($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payslip wherePeriodEnd($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payslip wherePeriodStart($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payslip wherePhilhealthEe($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payslip wherePhilhealthEr($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payslip whereSssEe($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payslip whereSssEr($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payslip whereThirteenthMonthPay($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payslip whereTotalDeductions($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payslip whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payslip whereUserId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payslip whereWithholdingTax($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payslip whereYear($value)
 * @property string|null $notes
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\PayslipAdjustment> $adjustments
 * @property-read int|null $adjustments_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payslip whereNotes($value)
 * @mixin \Eloquent
 */
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
 * @property numeric $overtime_pay
 * @property numeric $thirteenth_month_pay
 * @property numeric $gross_pay
 * @property numeric $sss_ee
 * @property numeric $sss_er
 * @property numeric $philhealth_ee
 * @property numeric $philhealth_er
 * @property numeric $pagibig_ee
 * @property numeric $pagibig_er
 * @property numeric $withholding_tax
 * @property numeric $other_deductions
 * @property numeric $total_deductions
 * @property numeric $net_pay
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
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payslip whereNetPay($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payslip whereOtherDeductions($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payslip whereOvertimePay($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payslip wherePagibigEe($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payslip wherePagibigEr($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payslip wherePaidLeaveDays($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payslip wherePeriodEnd($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payslip wherePeriodStart($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payslip wherePhilhealthEe($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payslip wherePhilhealthEr($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payslip whereSssEe($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payslip whereSssEr($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payslip whereThirteenthMonthPay($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payslip whereTotalDeductions($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payslip whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payslip whereUserId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payslip whereWithholdingTax($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payslip whereYear($value)
 * @property string|null $notes
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\PayslipAdjustment> $adjustments
 * @property-read int|null $adjustments_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payslip whereNotes($value)
 * @mixin \Eloquent
 */
class Payslip extends Model
{
    protected $fillable = [
        'user_id',
        'year',
        'month',
        'period_start',
        'period_end',
        'days_worked',
        'paid_leave_days',
        'hours_worked',
        'monthly_rate',
        'daily_rate',
        'hourly_rate',
        'allowance_monthly',
        'basic_pay',
        'allowance_pay',
        'overtime_pay',
        'thirteenth_month_pay',
        'gross_pay',
        'sss_ee',
        'sss_er',
        'philhealth_ee',
        'philhealth_er',
        'pagibig_ee',
        'pagibig_er',
        'withholding_tax',
        'other_deductions',
        'total_deductions',
        'net_pay',
        'currency',
        'notes',
        'generated_by',
        'generated_at',
    ];

    protected function casts(): array
    {
        return [
            'year' => 'integer',
            'month' => 'integer',
            'period_start' => 'date:Y-m-d',
            'period_end' => 'date:Y-m-d',
            'days_worked' => 'integer',
            'paid_leave_days' => 'decimal:2',
            'hours_worked' => 'decimal:2',
            'monthly_rate' => 'decimal:2',
            'daily_rate' => 'decimal:2',
            'hourly_rate' => 'decimal:2',
            'allowance_monthly' => 'decimal:2',
            'basic_pay' => 'decimal:2',
            'allowance_pay' => 'decimal:2',
            'overtime_pay' => 'decimal:2',
            'thirteenth_month_pay' => 'decimal:2',
            'gross_pay' => 'decimal:2',
            'sss_ee' => 'decimal:2',
            'sss_er' => 'decimal:2',
            'philhealth_ee' => 'decimal:2',
            'philhealth_er' => 'decimal:2',
            'pagibig_ee' => 'decimal:2',
            'pagibig_er' => 'decimal:2',
            'withholding_tax' => 'decimal:2',
            'other_deductions' => 'decimal:2',
            'total_deductions' => 'decimal:2',
            'net_pay' => 'decimal:2',
            'generated_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function generator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'generated_by');
    }

    public function adjustments(): HasMany
    {
        return $this->hasMany(PayslipAdjustment::class);
    }

    public function isThirteenthMonth(): bool
    {
        return (int) $this->month === 13;
    }
}
